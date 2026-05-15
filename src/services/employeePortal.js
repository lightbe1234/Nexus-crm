import { db } from './firebase.js';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';

// ---------------------------------------------
// ATTENDANCE
// ---------------------------------------------

export const getTodayAttendance = async (uid) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    const q = query(
      collection(db, 'attendance'),
      where('uid', '==', uid)
    );
    const snapshot = await getDocs(q);
    const todayDoc = snapshot.docs.find(d => d.data().date === today);
    if (!todayDoc) return null;
    return { id: todayDoc.id, ...todayDoc.data() };
  } catch (err) {
    console.error("getTodayAttendance error:", err);
    return null;
  }
};

/**
 * Get all attendance records for a specific user, ordered by date descending.
 */
export const getMyAttendance = async (uid) => {
  try {
    const q = query(
      collection(db, 'attendance'),
      where('uid', '==', uid)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    // Sort in-memory to avoid index requirement
    return docs.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  } catch (err) {
    console.error("getMyAttendance error:", err);
    return [];
  }
};

/**
 * Get ALL attendance records (admin use) optionally filtered by date.
 */
export const getAllAttendance = async (date = null) => {
  let q;
  if (date) {
    q = query(collection(db, 'attendance'), where('date', '==', date), orderBy('createdAt', 'desc'));
  } else {
    q = query(collection(db, 'attendance'), orderBy('date', 'desc'));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const subscribeToAllAttendance = (date, callback) => {
  const q = date 
    ? query(collection(db, 'attendance'), where('date', '==', date))
    : query(collection(db, 'attendance'), orderBy('date', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(docs);
  });
};

/**
 * Check in: creates a new attendance document for today.
 * Assumes caller already checked there's no existing record (getTodayAttendance).
 */
export const checkIn = async (uid, employeeData, workLocation = 'Office', shiftType = 'Full') => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0]; // "HH:MM:SS"

  // Determine if late (after 09:30)
  const [h, m] = timeStr.split(':').map(Number);
  const isLate = h > 9 || (h === 9 && m > 30);

  const result = await addDoc(collection(db, 'attendance'), {
    uid,
    employeeId: employeeData.employeeId || '',
    name: employeeData.fullName || employeeData.name || '',
    date: today,
    checkInTime: timeStr,
    checkOutTime: null,
    totalHours: null,
    status: isLate ? 'late' : 'checked-in',
    workLocation,
    shiftType,
    sessionActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Automatically update performance when checked in
  try {
    await upsertPerformance(uid, employeeData);
  } catch (err) {
    console.error('Failed to update performance on checkIn:', err);
  }

  return result;
};

/**
 * Check out: updates an existing attendance document.
 */
export const checkOut = async (attendanceId, checkInTime, totalBreakMinutes = 0) => {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];

  // Calculate total hours worked
  const [inH, inM, inS] = checkInTime.split(':').map(Number);
  const [outH, outM, outS] = timeStr.split(':').map(Number);
  const inSeconds = inH * 3600 + inM * 60 + inS;
  const outSeconds = outH * 3600 + outM * 60 + outS;
  
  // Deduct breaks
  const totalSeconds = Math.max(0, outSeconds - inSeconds);
  const breakSeconds = (totalBreakMinutes || 0) * 60;
  const netWorkingSeconds = Math.max(0, totalSeconds - breakSeconds);
  const diffHours = netWorkingSeconds / 3600;

  await updateDoc(doc(db, 'attendance', attendanceId), {
    checkOutTime: timeStr,
    totalHours: parseFloat(diffHours.toFixed(2)),
    status: 'checked-out',
    sessionActive: false,
    updatedAt: serverTimestamp(),
  });

  // Ensure performance is updated so avg hours reflects
  try {
    // We only have attendanceId and checkInTime here, but we can fetch the attendance doc
    // to get the UID, then call upsertPerformance with basic data.
    const attDoc = await getDoc(doc(db, 'attendance', attendanceId));
    if (attDoc.exists()) {
      const { uid, name, employeeId } = attDoc.data();
      await upsertPerformance(uid, { fullName: name, employeeId });
    }
  } catch (err) {
    console.error('Failed to update performance on checkOut:', err);
  }
};

/**
 * Start break: records break start time and updates status
 */
export const startBreak = async (attendanceId) => {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];
  await updateDoc(doc(db, 'attendance', attendanceId), {
    breakStartTime: timeStr,
    status: 'on-break',
    updatedAt: serverTimestamp(),
  });
};

/**
 * End break: calculates break duration and resumes work status
 */
export const endBreak = async (attendanceId, breakStartTime, totalBreakMinutesSoFar = 0) => {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];

  const [inH, inM, inS] = breakStartTime.split(':').map(Number);
  const [outH, outM, outS] = timeStr.split(':').map(Number);
  const inSeconds = inH * 3600 + inM * 60 + inS;
  const outSeconds = outH * 3600 + outM * 60 + outS;
  const breakDurationMins = Math.max(0, (outSeconds - inSeconds) / 60);

  await updateDoc(doc(db, 'attendance', attendanceId), {
    breakEndTime: timeStr,
    totalBreakMinutes: (totalBreakMinutesSoFar || 0) + parseFloat(breakDurationMins.toFixed(2)),
    status: 'checked-in',
    breakStartTime: null, // clear for next break
    updatedAt: serverTimestamp(),
  });
};

// ---------------------------------------------
// TASKS (employee-scoped queries on existing collection)
// ---------------------------------------------

/**
 * Get tasks assigned to a specific user UID.
 */
export const getMyTasks = async (uid) => {
  const q = query(
    collection(db, 'tasks'),
    where('assigneeId', '==', uid)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Real-time listener for tasks assigned to a specific user.
 * Returns an unsubscribe function.
 */
export const subscribeToMyTasks = (uid, callback) => {
  const q = query(
    collection(db, 'tasks'),
    where('assigneeId', '==', uid)
  );
  return onSnapshot(q, (snapshot) => {
    const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(docs);
  }, (err) => {
    console.error('subscribeToMyTasks error:', err);
    callback([]);
  });
};

/**
 * Real-time listener for attendance records for a specific user.
 * Returns an unsubscribe function.
 */
export const subscribeToMyAttendance = (uid, callback) => {
  const q = query(
    collection(db, 'attendance'),
    where('uid', '==', uid)
  );
  return onSnapshot(q, (snapshot) => {
    const docs = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    callback(docs);
  }, (err) => {
    console.error('subscribeToMyAttendance error:', err);
    callback([]);
  });
};

// ---------------------------------------------
// PERFORMANCE
// ---------------------------------------------

/**
 * Get performance record for a user for a given month (e.g. "2026-05").
 */
export const getMyPerformance = async (uid) => {
  const q = query(
    collection(db, 'performance'),
    where('uid', '==', uid),
    orderBy('month', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Get ALL performance records (admin use).
 */
export const getAllPerformance = async () => {
  const snapshot = await getDocs(collection(db, 'performance'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const subscribeToAllPerformance = (callback) => {
  const q = collection(db, 'performance');
  return onSnapshot(q, (snapshot) => {
    const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(docs);
  });
};

/**
 * Compute and upsert a performance record for a user for the current month.
 * Called after attendance check-out or task status update.
 */
export const upsertPerformance = async (uid, employeeData) => {
  const month = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const docId = `${uid}_${month}`;
  const ref = doc(db, 'performance', docId);

  // Fetch this month's attendance
  const attQ = query(
    collection(db, 'attendance'),
    where('uid', '==', uid),
    where('date', '>=', `${month}-01`),
    where('date', '<=', `${month}-31`)
  );
  const attSnap = await getDocs(attQ);
  const attendanceDays = attSnap.docs.filter(d =>
    ['checked-out', 'checked-in', 'late'].includes(d.data().status)
  ).length;

  // Fetch tasks
  const taskQ = query(collection(db, 'tasks'), where('assigneeId', '==', uid));
  const taskSnap = await getDocs(taskQ);
  const allTasks = taskSnap.docs.map(d => d.data());
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'Done').length;
  const pendingTasks = totalTasks - completedTasks;

  // Calculate Overdue & Productivity
  const todayDate = new Date().toISOString().split('T')[0];
  const overdueTasks = allTasks.filter(t => t.status !== 'Done' && t.dueDate && t.dueDate < todayDate).length;
  const productivityScore = totalTasks > 0 ? Math.max(0, Math.round(((totalTasks - overdueTasks) / totalTasks) * 100)) : 100;

  const workingDays = 22; // standard working days per month
  const attendancePercentage = Math.min(100, Math.round((attendanceDays / workingDays) * 100));
  const taskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;
  
  // Performance = Attendance (40%) + Task Completion (40%) + Productivity/Consistency (20%)
  const performancePercentage = Math.round((attendancePercentage * 0.4) + (taskRate * 0.4) + (productivityScore * 0.2));

  await setDoc(ref, {
    uid,
    employeeId: employeeData.employeeId || '',
    name: employeeData.fullName || employeeData.name || '',
    month,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    attendanceDays,
    workingDays,
    productivityScore,
    taskRate,
    attendancePercentage,
    performancePercentage: Math.min(100, performancePercentage),
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

// ---------------------------------------------
// EMPLOYEE PROFILE (own record)
// ---------------------------------------------

/**
 * Get own employee document (doc ID == uid).
 */
export const getMyEmployeeProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'employees', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// ---------------------------------------------
// ADMIN CRUD — Attendance & Performance
// ---------------------------------------------

export const updateAttendanceRecord = (id, data) =>
  updateDoc(doc(db, 'attendance', id), { ...data, updatedAt: serverTimestamp() });

export const deleteAttendanceRecord = (id) => deleteDoc(doc(db, 'attendance', id));

export const deletePerformanceRecord = (id) => deleteDoc(doc(db, 'performance', id));

import { db } from './firebase.js';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

export const fetchCollection = async (colName, orderField = 'createdAt') => {
  try {
    const q = collection(db, colName);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching ${colName}:`, error);
    return [];
  }
};

export const getClients = () => fetchCollection('clients');
export const getProjects = () => fetchCollection('projects');
export const getTasks = () => fetchCollection('tasks');
export const getInvoices = () => fetchCollection('invoices');
export const getActivities = () => fetchCollection('activities');
export const getUsers = async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addInvoice = (data) => addDoc(collection(db, 'invoices'), { ...data, createdAt: serverTimestamp() });
export const updateInvoice = (id, data) => updateDoc(doc(db, 'invoices', id), { ...data, updatedAt: serverTimestamp() });
export const addClient = (data) => addDoc(collection(db, 'clients'), { ...data, createdAt: serverTimestamp() });
export const addProject = (data) => addDoc(collection(db, 'projects'), { ...data, createdAt: serverTimestamp() });
export const updateProject = (id, data) => updateDoc(doc(db, 'projects', id), { ...data, updatedAt: serverTimestamp() });
export const addTask = (data) => addDoc(collection(db, 'tasks'), { ...data, createdAt: serverTimestamp() });
export const updateTask = (id, data) => updateDoc(doc(db, 'tasks', id), { ...data, updatedAt: serverTimestamp() });
export const addActivity = (data) => addDoc(collection(db, 'activities'), { ...data, createdAt: serverTimestamp() });
export const updateClient = (id, data) => updateDoc(doc(db, 'clients', id), { ...data, updatedAt: serverTimestamp() });
export const getSettings = async () => {
  const snap = await getDoc(doc(db, 'settings', 'system'));
  return snap.exists() ? snap.data() : null;
};
export const updateSettings = (data) => updateDoc(doc(db, 'settings', 'system'), { ...data, updatedAt: serverTimestamp() });
export const initSettings = async (data) => {
  const ref = doc(db, 'settings', 'system');
  const snap = await getDoc(ref);
  if (!snap.exists()) await setDoc(ref, { ...data, createdAt: serverTimestamp() });
};
export const getEmployees = () => fetchCollection('employees', 'joinDate');
export const addEmployee = (data) => addDoc(collection(db, 'employees'), { ...data, createdAt: serverTimestamp() });
export const updateEmployee = (id, data) => updateDoc(doc(db, 'employees', id), { ...data, updatedAt: serverTimestamp() });
export const deleteEmployee = (id) => deleteDoc(doc(db, 'employees', id));
export const getEmployee = async (id) => {
  const snap = await getDoc(doc(db, 'employees', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

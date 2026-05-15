import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDrc9P7pAUXP9_waCI4rGE6gy6tGu5qq8g",
  authDomain: "marketing-agency-crm.firebaseapp.com",
  projectId: "marketing-agency-crm",
  storageBucket: "marketing-agency-crm.firebasestorage.app",
  messagingSenderId: "211910553148",
  appId: "1:211910553148:web:9e4f2cdbbc4cff33a61d39",
  measurementId: "G-GEJ5WMMYY7"
};

// Primary app — used for the admin session
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Secondary app — used ONLY to create new employee Auth accounts
// This keeps the admin logged in while creating new users
const secondaryApp = initializeApp(firebaseConfig, "secondary");
const secondaryAuth = getAuth(secondaryApp);

const analytics = null;

export { auth, db, storage, analytics, secondaryAuth };

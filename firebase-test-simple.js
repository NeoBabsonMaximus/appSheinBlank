// Test script to verify Firebase connectivity (Node.js compatible)
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA18hvrsBazGjX2iAIKJKRPfofJy81jdC0",
  authDomain: "appsheinblank.firebaseapp.com",
  projectId: "appsheinblank",
  storageBucket: "appsheinblank.firebasestorage.app",
  messagingSenderId: "209741152261",
  appId: "1:209741152261:web:aa475aceb2f64b61b69c6c",
  measurementId: "G-JQ7Q9MBHPE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    
    // Test adding a document
    const testCollection = collection(db, 'test');
    const docRef = await addDoc(testCollection, {
      message: 'Test from React app',
      timestamp: new Date()
    });
    
    console.log('Document written with ID: ', docRef.id);
    
    // Test reading documents
    const querySnapshot = await getDocs(testCollection);
    console.log('Documents found:', querySnapshot.size);
    
    querySnapshot.forEach((doc) => {
      console.log(doc.id, ' => ', doc.data());
    });
    
    console.log('Firebase connection test successful!');
  } catch (error) {
    console.error('Firebase connection test failed:', error);
  }
};

// Run the test
testFirebaseConnection();

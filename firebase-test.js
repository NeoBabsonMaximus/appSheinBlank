// Test script to verify Firebase connectivity
import { db } from './src/config/firebase.js';
import { collection, addDoc, getDocs } from 'firebase/firestore';

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

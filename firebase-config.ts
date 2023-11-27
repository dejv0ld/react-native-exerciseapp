// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0y_4LuHq-7JeY6rGO1gId5ygF00ze4Nw",
  authDomain: "crossplatform-test.firebaseapp.com",
  projectId: "crossplatform-test",
  storageBucket: "crossplatform-test.appspot.com",
  messagingSenderId: "760588345799",
  appId: "1:760588345799:web:6dd7258e86ee2f28d6b9e2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore();

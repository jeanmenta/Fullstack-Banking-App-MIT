import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyByxkRnsNXBlhqrFeCz4abu48XCbFBCu_I",
    authDomain: "banking-app-9ce72.firebaseapp.com",
    projectId: "banking-app-9ce72",
    storageBucket: "banking-app-9ce72.appspot.com",
    messagingSenderId: "37386041409",
    appId: "1:37386041409:web:2d61838344c1d32b802ec0",
    measurementId: "G-2LB3PZMG1Y"
};

initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();

// Initialize Firebase Auth
const auth = getAuth();

export { auth, provider }; // Export them for use in other files
export default firebaseConfig;
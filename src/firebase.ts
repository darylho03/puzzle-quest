import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyA7po6gqQLeMPtRRvqPlHqByuUODkUta6Q",
    authDomain: "daryls-puzzle-quest.firebaseapp.com",
    projectId: "daryls-puzzle-quest",
    storageBucket: "daryls-puzzle-quest.firebasestorage.app",
    messagingSenderId: "1037372211529",
    appId: "1:1037372211529:web:235f2bf1b2eac3f46b5a98",
    measurementId: "G-01LBVDZD3M"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export { app };
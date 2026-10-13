import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";


const firebaseConfig = {
    apiKey: "AIzaSyBx_nShWGFDC0iZ0M8VC_hSz2FfUUXNMWg",
    authDomain: "projekkepemimpinan-9d557.firebaseapp.com",
    databaseURL: "https://projekkepemimpinan-9d557-default-rtdb.firebaseio.com",
    projectId: "projekkepemimpinan-9d557",
    storageBucket: "projekkepemimpinan-9d557.firebasestorage.app",
    messagingSenderId: "425214712535",
    appId: "1:425214712535:web:b28b326afd99c12440ee92",
    measurementId: "G-Z2WE4YLJ3M"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);


export {
    app,
    auth,
    db,
    storage
};
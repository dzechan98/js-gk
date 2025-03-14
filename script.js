"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDu0e6f9V1Es0L1KOJ_amQ9EJ6Zz-RhE7A",
  authDomain: "qltv-7c9be.firebaseapp.com",
  projectId: "qltv-7c9be",
  storageBucket: "qltv-7c9be.firebasestorage.app",
  messagingSenderId: "411515029850",
  appId: "1:411515029850:web:cc90d42dc1bd4712ad0b63",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export const checkAuthentication = async () => {
  return new Promise((resolve) => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const queryUser = query(
          collection(db, "users"),
          where("email", "==", user.email)
        );

        const userSnapShot = await getDocs(queryUser);
        let userInfo;

        userSnapShot.forEach((doc) => {
          userInfo = doc.data();
        });

        resolve(userInfo); // authenticated
      } else {
        resolve(null); // not authenticated
      }
    });
  });
};

export const checkRole = async () => {
  const userInfo = await checkAuthentication();

  console.log(userInfo);
  if (!userInfo) {
    window.location.href = "/authenticate/login.html";
  }

  if (userInfo.role === "admin") {
    window.location.href = "/books/list.html";
  } else {
    window.location.href = "/pages/list-book.html";
  }
};

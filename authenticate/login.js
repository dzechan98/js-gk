import { checkRole } from "../script.js";
// Firebase configuration (replace with your config)
const firebaseConfig = {
  apiKey: "AIzaSyDu0e6f9V1Es0L1KOJ_amQ9EJ6Zz-RhE7A",
  authDomain: "qltv-7c9be.firebaseapp.com",
  projectId: "qltv-7c9be",
  storageBucket: "qltv-7c9be.firebasestorage.app",
  messagingSenderId: "411515029850",
  appId: "1:411515029850:web:cc90d42dc1bd4712ad0b63",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Show loading spinner
document.getElementById("loadingSpinner").classList.remove("hidden");

// Check authentication state
auth.onAuthStateChanged((user) => {
  // Hide loading spinner
  document.getElementById("loadingSpinner").classList.add("hidden");

  if (user) {
    // User is logged in, redirect to main page
    checkRole();
    //window.location.href = "/pages/list-book.html";
  } else {
    // User is not logged in, show login form
    document.getElementById("loginContainer").classList.remove("hidden");
  }
});

// Form validation
function validateLoginForm(email, password) {
  let isValid = true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Clear previous errors
  document
    .querySelectorAll(".text-red-500")
    .forEach((el) => el.classList.add("hidden"));

  // Email validation
  if (!emailRegex.test(email)) {
    document.getElementById("emailError").textContent =
      "Please enter a valid email address";
    document.getElementById("emailError").classList.remove("hidden");
    isValid = false;
  }

  // Password validation
  if (password.length < 6) {
    document.getElementById("passwordError").textContent =
      "Password must be at least 6 characters";
    document.getElementById("passwordError").classList.remove("hidden");
    isValid = false;
  }

  return isValid;
}

// Login function
async function loginUser(email, password) {
  try {
    const loginButton = document.getElementById("loginButton");
    loginButton.disabled = true;
    loginButton.innerHTML = "Logging in...";

    const userCredential = await auth.signInWithEmailAndPassword(
      email,
      password
    );
    // Redirect handled by auth state listener
    localStorage.setItem(
      "currentUser",
      JSON.stringify(userCredential.user.email)
    );
  } catch (error) {
    const loginButton = document.getElementById("loginButton");
    loginButton.disabled = false;
    loginButton.innerHTML = "Sign In";

    let errorMessage = "Sai mat khau hoac tai khoan! Vui long thu lai";
    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "User not found";
        break;
      case "auth/wrong-password":
        errorMessage = "Incorrect password";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address";
        break;
      case "auth/user-disabled":
        errorMessage = "Account disabled";
        break;
    }
    alert(errorMessage);
  }
}

// Form submission handler
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (validateLoginForm(email, password)) {
    await loginUser(email, password);
  }
});

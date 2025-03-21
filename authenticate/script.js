// Firebase Configuration (replace with your config)
const firebaseConfig = {
  apiKey: "AIzaSyDu0e6f9V1Es0L1KOJ_amQ9EJ6Zz-RhE7A",
  authDomain: "qltv-7c9be.firebaseapp.com",
  projectId: "qltv-7c9be",
  storageBucket: "qltv-7c9be.firebasestorage.app",
  messagingSenderId: "411515029850",
  appId: "1:411515029850:web:cc90d42dc1bd4712ad0b63",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM Elements
const loading = document.getElementById("loading");
const authUI = document.getElementById("authUI");

const authForms = document.getElementById("authForms");
const userInfo = document.getElementById("userInfo");
const emailForm = document.getElementById("emailForm");
const authButton = document.getElementById("authButton");
const toggleButton = document.getElementById("toggleButton");
const toggleText = document.getElementById("toggleText");
const errorMessage = document.getElementById("errorMessage");

// Auth State
let isSignUp = false;

// Toggle between Sign Up/Sign In
function toggleAuthMode() {
  isSignUp = !isSignUp;
  authButton.textContent = isSignUp ? "Sign Up" : "Sign In";
  toggleButton.textContent = isSignUp ? "Sign In" : "Sign Up";
  toggleText.textContent = isSignUp
    ? "Already have an account?"
    : "Don't have an account?";
}

// Handle Email/Password Auth
emailForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    if (isSignUp) {
      await auth.createUserWithEmailAndPassword(email, password);
    } else {
      await auth.signInWithEmailAndPassword(email, password);
    }
    showError(""); // Clear error on success
  } catch (error) {
    showError(error.message);
  }
});

// Google Sign-In
async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
  } catch (error) {
    showError(error.message);
  }
}

// Logout
async function logout() {
  try {
    await auth.signOut();
  } catch (error) {
    showError(error.message);
  }
}

// Show Error Message
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.toggle("hidden", !message);
}

// Auth State Listener
auth.onAuthStateChanged((user) => {
  loading.classList.add("hidden");
  authUI.classList.remove("hidden");

  if (user) {
    // User is signed in
    authForms.classList.add("hidden");
    userInfo.classList.remove("hidden");

    // Update user info
    document.getElementById("userName").textContent =
      user.displayName || "User";
    document.getElementById("userEmail").textContent = user.email;
    document.getElementById("userPhoto").src =
      user.photoURL || "https://via.placeholder.com/150";
  } else {
    // User is signed out
    authForms.classList.remove("hidden");
    userInfo.classList.add("hidden");
  }
});

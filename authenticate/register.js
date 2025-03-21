// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDu0e6f9V1Es0L1KOJ_amQ9EJ6Zz-RhE7A",
  authDomain: "qltv-7c9be.firebaseapp.com",
  projectId: "qltv-7c9be",
  storageBucket: "qltv-7c9be.firebasestorage.app",
  messagingSenderId: "411515029850",
  appId: "1:411515029850:web:cc90d42dc1bd4712ad0b63",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

const usersCollection = db.collection("users");

// Form validation
function validateForm(email, password, confirmPassword) {
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

  // Confirm password validation
  if (password !== confirmPassword) {
    document.getElementById("confirmPasswordError").textContent =
      "Passwords do not match";
    document.getElementById("confirmPasswordError").classList.remove("hidden");
    isValid = false;
  }

  return isValid;
}

// Registration function
async function registerUser(email, password) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(
      email,
      password
    );

    const usersCollection = db.collection("users");
    await usersCollection.add({ email, role: "user" });
    localStorage.setItem(
      "currentUser",
      JSON.stringify(userCredential.user.email)
    );
    window.location.href = "login.html";
  } catch (error) {
    let errorMessage = "Registration failed. Please try again.";
    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "Email is already registered";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address";
        break;
      case "auth/weak-password":
        errorMessage = "Password is too weak";
        break;
    }
    alert(errorMessage);
  }
}

// Form submission handler
document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (validateForm(email, password, confirmPassword)) {
      await registerUser(email, password);
    }
  });

// Real-time password validation
document.getElementById("confirmPassword").addEventListener("input", () => {
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword && confirmPassword.length > 0) {
    document.getElementById("confirmPasswordError").textContent =
      "Passwords do not match";
    document.getElementById("confirmPasswordError").classList.remove("hidden");
  } else {
    document.getElementById("confirmPasswordError").classList.add("hidden");
  }
});

import { checkAuthentication } from "../script.js";

document.addEventListener("DOMContentLoaded", async function () {
  const currentPath = window.location.pathname;

  // Remove active class from all links
  document.querySelectorAll("nav a").forEach((link) => {
    link.classList.remove("bg-gray-900", "text-white");
    link.classList.add("text-gray-300");
  });

  // Add active class based on current path
  if (currentPath.includes("/books/")) {
    document
      .getElementById("books-link")
      .classList.add("bg-gray-900", "text-white");
    document.getElementById("books-link").classList.remove("text-gray-300");
  } else if (currentPath.includes("/category/")) {
    document
      .getElementById("category-link")
      .classList.add("bg-gray-900", "text-white");
    document.getElementById("category-link").classList.remove("text-gray-300");
  } else if (currentPath.includes("/user/")) {
    document
      .getElementById("users-link")
      .classList.add("bg-gray-900", "text-white");
    document.getElementById("users-link").classList.remove("text-gray-300");
  } else if (currentPath.includes("/admin/order/")) {
    document
      .getElementById("orders-link")
      .classList.add("bg-gray-900", "text-white");
    document.getElementById("orders-link").classList.remove("text-gray-300");
  }

  const userInfo = await checkAuthentication();
  if (userInfo.role != "admin") {
    window.location.href = "/authenticate/deniedAccess.html";
  }
});

// Firebase configuration
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
const db = firebase.firestore();

// Reference to users collection
const usersCollection = db.collection("users");

// Form submit handler
document.getElementById("userForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const userId = document.getElementById("userId").value;
  const userData = {
    // firstName: document.getElementById("firstName").value,
    // lastName: document.getElementById("lastName").value,
    // age: parseInt(document.getElementById("age").value),
    email: document.getElementById("email").value,
  };

  // await updateDoc(doc(db, "users", userId), userData);
  // showToast("Cập nhật thành công!", "success");

  try {
    if (userId) {
      // Update existing user
      await usersCollection.doc(userId).update(userData);
    } else {
      // Add new user
      await usersCollection.add(userData);
    }
    resetForm();
  } catch (error) {
    console.error("Error saving user: ", error);
    alert("Error saving user!");
  }
});

// Read users in real-time
usersCollection.onSnapshot((snapshot) => {
  const usersTable = document.getElementById("usersTable");
  usersTable.innerHTML = "";

  snapshot.forEach((doc) => {
    const user = doc.data();
    const row = `
              <tr>
                  <td class="px-6 py-4 whitespace-nowrap">${user.email}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                      <button onclick="editUser('${doc.id}')" class="text-blue-600 hover:text-blue-900">Edit</button>
                      <button onclick="deleteUser('${doc.id}')" class="text-red-600 hover:text-red-900 ml-2">Delete</button>
                  </td>
              </tr>
          `;
    usersTable.innerHTML += row;
  });
});

// Edit user
window.editUser = async (id) => {
  const doc = await usersCollection.doc(id).get();
  const user = doc.data();

  document.getElementById("userId").value = id;
  // document.getElementById("firstName").value = user.firstName;
  // document.getElementById("lastName").value = user.lastName;
  // document.getElementById("age").value = user.age;
  document.getElementById("email").value = user.email;
};

// Delete user
window.deleteUser = async (id) => {
  if (confirm("Are you sure you want to delete this user?")) {
    try {
      await usersCollection.doc(id).delete();
    } catch (error) {
      console.error("Error deleting user: ", error);
      alert("Error deleting user!");
    }
  }
};

// Reset form
window.resetForm = () => {
  document.getElementById("userForm").reset();
  document.getElementById("userId").value = "";
};

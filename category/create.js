import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDu0e6f9V1Es0L1KOJ_amQ9EJ6Zz-RhE7A",
  authDomain: "qltv-7c9be.firebaseapp.com",
  projectId: "qltv-7c9be",
  storageBucket: "qltv-7c9be.firebasestorage.app",
  messagingSenderId: "411515029850",
  appId: "1:411515029850:web:cc90d42dc1bd4712ad0b63",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.addCategory = async () => {
  const categoryData = {
    name: document.getElementById("name").value.trim(),
    description: document.getElementById("description").value.trim(),
    createdAt: new Date(),
  };

  if (!validateCategory(categoryData)) return;

  try {
    await addDoc(collection(db, "categories"), categoryData);
    showToast("Thêm danh mục thành công!", "success");
    setTimeout(() => {
      window.location.href = "list.html";
    }, 1500);
  } catch (error) {
    showToast("Lỗi khi thêm danh mục!", "error");
    console.error(error);
  }
};

function validateCategory(category) {
  if (!category.name) {
    showToast("Vui lòng nhập tên danh mục!", "warning");
    return false;
  }
  if (category.name.length < 3) {
    showToast("Tên danh mục phải có ít nhất 3 ký tự!", "warning");
    return false;
  }
  return true;
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `fixed top-4 right-4 p-4 rounded-lg text-white ${
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : type === "warning"
      ? "bg-yellow-500"
      : "bg-blue-500"
  } shadow-lg z-50`;
  toast.innerHTML = `
          <div class="flex items-center">
              <i class="fas fa-${
                type === "success"
                  ? "check-circle"
                  : type === "error"
                  ? "exclamation-circle"
                  : type === "warning"
                  ? "exclamation-triangle"
                  : "info-circle"
              } mr-2"></i>
              ${message}
          </div>
      `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("opacity-0", "transition-opacity", "duration-300");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
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
let categoryId = null;

async function loadCategory() {
  const urlParams = new URLSearchParams(window.location.search);
  categoryId = urlParams.get("id");

  if (!categoryId) {
    showToast("Không tìm thấy ID danh mục!", "error");
    setTimeout(() => {
      window.location.href = "list.html";
    }, 1500);
    return;
  }

  try {
    const docRef = doc(db, "categories", categoryId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const category = docSnap.data();
      document.getElementById("name").value = category.name || "";
      document.getElementById("description").value = category.description || "";
    } else {
      showToast("Không tìm thấy danh mục!", "error");
      setTimeout(() => {
        window.location.href = "list-category.html";
      }, 1500);
    }
  } catch (error) {
    console.error("Error loading category:", error);
    showToast("Lỗi khi tải thông tin danh mục!", "error");
  }
}

window.updateCategory = async () => {
  const updatedData = {
    name: document.getElementById("name").value.trim(),
    description: document.getElementById("description").value.trim(),
    updatedAt: new Date(),
  };

  if (!validateCategory(updatedData)) return;

  try {
    await updateDoc(doc(db, "categories", categoryId), updatedData);
    showToast("Cập nhật thành công!", "success");
    setTimeout(() => {
      window.location.href = "list.html";
    }, 1500);
  } catch (error) {
    showToast("Lỗi khi cập nhật!", "error");
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

document.addEventListener("DOMContentLoaded", loadCategory);

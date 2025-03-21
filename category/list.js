import { checkAuthentication } from "../script.js";
document.addEventListener("DOMContentLoaded", async function () {
  const currentPath = window.location.pathname;

  document.querySelectorAll("nav a").forEach((link) => {
    link.classList.remove("bg-gray-900", "text-white");
    link.classList.add("text-gray-300");
  });

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

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
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
let unsubscribe = null;

async function setupRealtimeUpdates() {
  if (unsubscribe) {
    unsubscribe();
  }

  const q = query(collection(db, "categories"));
  unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      renderCategories(querySnapshot);
    },
    (error) => {
      console.error("Error listening to categories collection:", error);
      showToast("Lỗi theo dõi dữ liệu!", "error");
    }
  );
}

function renderCategories(querySnapshot) {
  const categoryList = document.getElementById("categoryList");
  categoryList.innerHTML = "";

  if (querySnapshot.empty) {
    categoryList.innerHTML = `
      <tr>
          <td colspan="3" class="p-4 text-center text-gray-500">
              Không có dữ liệu danh mục
          </td>
      </tr>
    `;
    return;
  }

  querySnapshot.forEach((doc) => {
    const category = doc.data();

    categoryList.innerHTML += `
      <tr class="hover:bg-gray-50">
          <td class="p-3 font-medium">${category.name}</td>
          <td class="p-3">
              <div class="max-w-prose overflow-hidden text-ellipsis">
                  ${category.description || "Không có mô tả"}
              </div>
          </td>
          <td class="p-3 text-center">
              <a href="edit.html?id=${doc.id}" 
                  class="text-blue-500 hover:text-blue-600 mr-4">
                  <i class="fas fa-edit"></i>
              </a>
              <button onclick="deleteCategory('${doc.id}')" 
                  class="text-red-500 hover:text-red-600">
                  <i class="fas fa-trash"></i>
              </button>
          </td>
      </tr>
    `;
  });
}

window.deleteCategory = async (id) => {
  if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;

  try {
    await deleteDoc(doc(db, "categories", id));
    showToast("Xóa danh mục thành công!", "success");
  } catch (error) {
    showToast("Lỗi khi xóa danh mục!", "error");
    console.error("Lỗi khi xóa danh mục:", error);
  }
};

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

document.addEventListener("DOMContentLoaded", async () => {
  setupRealtimeUpdates();
});

window.addEventListener("beforeunload", () => {
  if (unsubscribe) {
    unsubscribe();
  }
});

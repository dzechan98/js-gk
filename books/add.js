import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
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

async function loadCategories() {
  try {
    const querySnapshot = await getDocs(collection(db, "categories"));
    const genreSelect = document.getElementById("genre");
    genreSelect.innerHTML = '<option value="">Chọn thể loại</option>';

    querySnapshot.forEach((doc) => {
      const category = doc.data();
      genreSelect.innerHTML += `
                  <option value="${doc.id}">${category.name}</option>
              `;
    });
  } catch (error) {
    console.error("Error loading categories:", error);
    showToast("Lỗi khi tải danh mục!", "error");
  }
}

window.addBook = async () => {
  const bookData = {
    title: document.getElementById("title").value.trim(),
    author: document.getElementById("author").value.trim(),
    genreId: document.getElementById("genre").value,
    price: parseFloat(document.getElementById("price").value),
    imageUrl: document.getElementById("imageUrl").value.trim(),
    description: document.getElementById("description").value.trim(),
    createdAt: new Date(),
  };

  if (!validateBook(bookData)) return;

  try {
    await addDoc(collection(db, "books"), bookData);
    showToast("Thêm sách thành công!", "success");
    setTimeout(() => {
      window.location.href = "list.html";
    }, 1500);
  } catch (error) {
    showToast("Lỗi khi thêm sách!", "error");
    console.error(error);
  }
};

function validateBook(book) {
  if (!book.title || !book.author || !book.genreId || !book.price) {
    showToast("Vui lòng điền đầy đủ thông tin bắt buộc!", "warning");
    return false;
  }
  if (isNaN(book.price) || book.price <= 0) {
    showToast("Giá tiền không hợp lệ!", "warning");
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

document.addEventListener("DOMContentLoaded", loadCategories);

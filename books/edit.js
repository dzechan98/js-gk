import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
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
let bookId = null;

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

async function loadBook() {
  const urlParams = new URLSearchParams(window.location.search);
  bookId = urlParams.get("id");

  if (!bookId) {
    showToast("Không tìm thấy ID sách!", "error");
    setTimeout(() => {
      window.location.href = "list.html";
    }, 1500);
    return;
  }

  try {
    const docRef = doc(db, "books", bookId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const book = docSnap.data();
      document.getElementById("title").value = book.title || "";
      document.getElementById("author").value = book.author || "";
      document.getElementById("genre").value = book.genreId || "";
      document.getElementById("price").value = book.price || "";
      document.getElementById("imageUrl").value = book.imageUrl || "";
      document.getElementById("description").value = book.description || "";
    } else {
      showToast("Không tìm thấy sách!", "error");
      setTimeout(() => {
        window.location.href = "list.html";
      }, 1500);
    }
  } catch (error) {
    console.error("Error loading book:", error);
    showToast("Lỗi khi tải thông tin sách!", "error");
  }
}

window.updateBook = async () => {
  const updatedData = {
    title: document.getElementById("title").value.trim(),
    author: document.getElementById("author").value.trim(),
    genreId: document.getElementById("genre").value,
    price: parseFloat(document.getElementById("price").value),
    imageUrl: document.getElementById("imageUrl").value.trim(),
    description: document.getElementById("description").value.trim(),
    updatedAt: new Date(),
  };

  if (!validateBook(updatedData)) return;

  try {
    await updateDoc(doc(db, "books", bookId), updatedData);
    showToast("Cập nhật thành công!", "success");
    setTimeout(() => {
      window.location.href = "list.html";
    }, 1500);
  } catch (error) {
    showToast("Lỗi khi cập nhật!", "error");
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

document.addEventListener("DOMContentLoaded", async () => {
  await loadCategories();
  await loadBook();
});

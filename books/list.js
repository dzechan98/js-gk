import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getAuth,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  query,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { checkAuthentication } from "../script.js";

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
const auth = getAuth(app);

let categories = [];
let unsubscribe = null;

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

  document.getElementById("btnLogOut").addEventListener("click", async () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      await signOut(auth);
      localStorage.removeItem("currentUser");
      window.location.href = "/authenticate/login.html";
    }
  });

  const userInfo = await checkAuthentication();
  if (userInfo.role != "admin") {
    window.location.href = "/authenticate/deniedAccess.html";
  }
});

async function loadCategories() {
  try {
    const querySnapshot = await getDocs(collection(db, "categories"));
    categories = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Populate category filter
    const categoryFilter = document.getElementById("categoryFilter");
    categoryFilter.innerHTML = '<option value="">Tất cả thể loại</option>';
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categoryFilter.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading categories:", error);
    showToast("Lỗi khi tải danh mục!", "error");
  }
}

async function setupRealtimeUpdates() {
  if (unsubscribe) {
    unsubscribe();
  }

  const q = query(collection(db, "books"));
  unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      allBooks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      applyFilters();
    },
    (error) => {
      console.error("Error listening to books collection:", error);
      showToast("Lỗi theo dõi dữ liệu!", "error");
    }
  );
}

let allBooks = [];
let debounceTimeout;

function applyFilters() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const selectedCategoryId = document.getElementById("categoryFilter").value;

  // console.log(allBooks);

  const filteredBooks = allBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm);
    const matchesCategory =
      !selectedCategoryId || book.genreId === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  renderBooks(filteredBooks);
}

function renderBooks(books) {
  const bookList = document.getElementById("bookList");
  bookList.innerHTML = "";

  if (books.length === 0) {
    bookList.innerHTML = `
  <tr>
    <td colspan="7" class="p-4 text-center text-gray-500">
      Không có dữ liệu sách
    </td>
  </tr>
`;
    return;
  }

  books.forEach((book) => {
    const defaultImageUrl = "https://via.placeholder.com/50x70?text=No+Image";
    const imageUrl =
      book.imageUrl && book.imageUrl.trim() !== ""
        ? book.imageUrl
        : defaultImageUrl;
    const category = categories.find((c) => c.id === book.genreId);

    bookList.innerHTML += `
  <tr class="hover:bg-gray-50">
    <td class="p-3">
      <img src="${imageUrl}" alt="${book.title}"
           class="w-12 h-16 object-cover"
           onerror="this.src='${defaultImageUrl}'">
    </td>
    <td class="p-3">${book.title}</td>
    <td class="p-3">${book.author}</td>
    <td class="p-3">${category ? category.name : "Không xác định"}</td>
    <td class="p-3">${formatPrice(book.price)}</td>
    <td class="p-3">
      <div class="max-w-xs overflow-hidden text-ellipsis">
        ${book.description || "Không có mô tả"}
      </div>
    </td>
    <td class="p-3 text-center">
      <a href="edit.html?id=${book.id}"
         class="text-blue-500 hover:text-blue-600 mr-4">
        <i class="fas fa-edit"></i>
      </a>
      <button onclick="deleteBook('${book.id}')"
         class="text-red-500 hover:text-red-600">
        <i class="fas fa-trash"></i>
      </button>
    </td>
  </tr>
`;
  });
}

window.deleteBook = async (id) => {
  if (!confirm("Bạn có chắc chắn muốn xóa sách này?")) return;

  try {
    await deleteDoc(doc(db, "books", id));
    showToast("Xóa sách thành công!", "success");
  } catch (error) {
    showToast("Lỗi khi xóa sách!", "error");
    console.error("Lỗi khi xóa sách:", error);
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

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadCategories();
  setupRealtimeUpdates();

  document.getElementById("searchInput").addEventListener("input", (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      applyFilters();
    }, 300);
  });

  document
    .getElementById("categoryFilter")
    .addEventListener("change", applyFilters);
});

window.addEventListener("beforeunload", () => {
  if (unsubscribe) {
    unsubscribe();
  }

  const q = query(collection(db, "books"));
  unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      allBooks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      applyFilters();
    },
    (error) => {
      console.error("Error listening to books collection:", error);
      showToast("Lỗi theo dõi dữ liệu!", "error");
    }
  );
});

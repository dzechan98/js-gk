import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
  query,
  doc,
  where,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import {
  getAuth,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

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
let allBooks = [];
let currentPage = 1;
let booksPerPage = 8;
let viewMode = "grid"; // 'grid' or 'list'

async function getUser(email) {
  let res;
  const q = query(collection(db, "users"), where("email", "==", email));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    res = doc.id;
  });

  return res;
}

async function loadCategories() {
  try {
    document.getElementById("status").classList.remove("hidden");
    const querySnapshot = await getDocs(collection(db, "categories"));
    categories = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    populateCategoryFilter();
    document.getElementById("status").classList.add("hidden");
  } catch (error) {
    console.error("Error loading categories:", error);
    showToast("Lỗi khi tải danh mục!", "error");
    document.getElementById("status").classList.add("hidden");
  }
}

function populateCategoryFilter() {
  const filter = document.getElementById("filterCategory");
  filter.innerHTML = '<option value="">Tất cả thể loại</option>';
  categories.forEach((category) => {
    filter.innerHTML += `<option value="${category.id}">${category.name}</option>`;
  });
}

async function setupRealtimeUpdates() {
  if (unsubscribe) {
    unsubscribe();
  }

  document.getElementById("status").classList.remove("hidden");
  const q = query(collection(db, "books"));
  unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      allBooks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      filterBooks();
      updateCartCount();
      document.getElementById("status").classList.add("hidden");
    },
    (error) => {
      console.error("Error listening to books collection:", error);
      showToast("Lỗi theo dõi dữ liệu!", "error");
      document.getElementById("status").classList.add("hidden");
    }
  );

  document
    .getElementById("logoutButton")
    .addEventListener("click", async () => {
      if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        await signOut(auth);
        localStorage.removeItem("currentUser");
        window.location.href = "/authenticate/login.html";
      }
    });
}

function filterBooks() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const selectedCategory = document.getElementById("filterCategory").value;

  const filteredBooks = allBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm);
    const matchesCategory =
      !selectedCategory || book.genreId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Reset to first page when filtering
  currentPage = 1;
  renderPagination(filteredBooks.length);
  renderBooks(filteredBooks);
}

function renderBooks(books) {
  const bookList = document.getElementById("bookList");
  bookList.innerHTML = "";

  if (books.length === 0) {
    bookList.innerHTML = `
      <div class="col-span-full text-center text-gray-500">
        Không tìm thấy sách phù hợp
      </div>
    `;
    return;
  }

  // Calculate pagination
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const paginatedBooks = books.slice(startIndex, endIndex);

  // Update class based on view mode
  if (viewMode === "grid") {
    bookList.className =
      "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6";
  } else {
    bookList.className = "divide-y divide-gray-200";
  }

  paginatedBooks.forEach((book) => {
    const defaultImageUrl = "https://via.placeholder.com/150x200?text=No+Image";
    const imageUrl = book.imageUrl?.trim() || defaultImageUrl;
    const category = categories.find((c) => c.id === book.genreId);

    if (viewMode === "grid") {
      bookList.innerHTML += `
      <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <img src="${imageUrl}" alt="${book.title}"
             class="w-full h-48 object-cover"
             onerror="this.src='${defaultImageUrl}'">
        <div class="p-4">
          <h3 class="text-lg font-semibold">${book.title}</h3>
          <p class="text-sm text-gray-600">${book.author}</p>
          <p class="text-sm text-gray-600">${
            category ? category.name : "Không xác định"
          }</p>
          <p class="text-lg font-bold text-blue-600">${formatPrice(
            book.price
          )}</p>
          <p class="text-sm text-gray-700 truncate">${
            book.description || "Không có mô tả"
          }</p>
          <button onclick="addToCart('${book.id}')"
                  class="w-full mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            <i class="fas fa-cart-plus mr-2"></i>Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    `;
    } else {
      bookList.innerHTML += `
      <div class="flex py-4 hover:bg-gray-50 transition-colors">
        <img src="${imageUrl}" alt="${book.title}"
             class="w-24 h-32 object-cover rounded-md mr-4"
             onerror="this.src='${defaultImageUrl}'">
        <div class="flex-1">
          <h3 class="text-lg font-semibold">${book.title}</h3>
          <div class="flex flex-wrap gap-2 mb-2">
            <p class="text-sm text-gray-600">${book.author}</p>
            <span class="text-gray-400">|</span>
            <p class="text-sm text-gray-600">${
              category ? category.name : "Không xác định"
            }</p>
          </div>
          <p class="text-sm text-gray-700 mb-2">${
            book.description || "Không có mô tả"
          }</p>
          <div class="flex justify-between items-center">
            <p class="text-lg font-bold text-blue-600">${formatPrice(
              book.price
            )}</p>
            <button onclick="addToCart('${book.id}')"
                    class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              <i class="fas fa-cart-plus mr-2"></i>Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
    `;
    }
  });
}

function renderPagination(totalBooks) {
  const totalPages = Math.ceil(totalBooks / booksPerPage);
  const paginationNumbers = document.getElementById("paginationNumbers");
  paginationNumbers.innerHTML = "";

  // Previous button
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;

  // Generate page numbers
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // First page
  if (startPage > 1) {
    paginationNumbers.innerHTML += `
    <button onclick="changePage(1)" class="px-3 py-1 rounded-md border hover:bg-gray-100">1</button>
  `;
    if (startPage > 2) {
      paginationNumbers.innerHTML += `
      <span class="px-2">...</span>
    `;
    }
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    paginationNumbers.innerHTML += `
    <button onclick="changePage(${i})" class="px-3 py-1 rounded-md ${
      currentPage === i
        ? "bg-blue-500 text-white"
        : "bg-white text-gray-700 border hover:bg-gray-100"
    }">${i}</button>
  `;
  }

  // Last page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationNumbers.innerHTML += `
      <span class="px-2">...</span>
    `;
    }
    paginationNumbers.innerHTML += `
    <button onclick="changePage(${totalPages})" class="px-3 py-1 rounded-md border hover:bg-gray-100">${totalPages}</button>
  `;
  }
}

window.changePage = (page) => {
  currentPage = page;
  filterBooks();
};

window.addToCart = async (bookId) => {
  const userId = await getUser(
    localStorage
      .getItem("currentUser")
      .substr(1, localStorage.getItem("currentUser").length - 2)
  );

  const cartRef = doc(db, "carts", userId);

  try {
    const cartDoc = await getDoc(cartRef);
    if (cartDoc.exists()) {
      const cartData = cartDoc.data();
      const itemIndex = cartData.items.findIndex(
        (item) => item.bookId === bookId
      );

      if (itemIndex !== -1) {
        // If the book is already in the cart, increment the quantity
        cartData.items[itemIndex].quantity += 1;
      } else {
        // If the book is not in the cart, add it with quantity 1
        cartData.items.push({ bookId, quantity: 1 });
      }

      await setDoc(cartRef, { items: cartData.items });
      showToast("Đã cập nhật giỏ hàng!", "success");
    } else {
      // If the cart doesn't exist, create it with the new book
      await setDoc(cartRef, { items: [{ bookId, quantity: 1 }] });
      showToast("Đã thêm sách vào giỏ hàng!", "success");
    }
    updateCartCount();
  } catch (error) {
    showToast("Lỗi khi cập nhật giỏ hàng!", "error");
    console.error(error);
  }
};

async function updateCartCount() {
  const userId = await getUser(
    localStorage
      .getItem("currentUser")
      .substr(1, localStorage.getItem("currentUser").length - 2)
  );
  const cartRef = doc(db, "carts", userId);

  try {
    const cartDoc = await getDoc(cartRef);
    if (cartDoc.exists()) {
      const cartData = cartDoc.data();
      const itemCount = cartData.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      document.getElementById("cartCount").textContent = itemCount;
    } else {
      document.getElementById("cartCount").textContent = "0";
    }
  } catch (error) {
    console.error("Error updating cart count:", error);
  }
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

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadCategories();
  setupRealtimeUpdates();

  document.getElementById("searchInput").addEventListener("input", filterBooks);
  document
    .getElementById("filterCategory")
    .addEventListener("change", filterBooks);

  // View mode buttons
  document.getElementById("gridViewButton").addEventListener("click", () => {
    viewMode = "grid";
    document
      .getElementById("gridViewButton")
      .classList.replace("text-gray-500", "text-blue-500");
    document
      .getElementById("listViewButton")
      .classList.replace("text-blue-500", "text-gray-500");
    filterBooks();
  });

  document.getElementById("listViewButton").addEventListener("click", () => {
    viewMode = "list";
    document
      .getElementById("listViewButton")
      .classList.replace("text-gray-500", "text-blue-500");
    document
      .getElementById("gridViewButton")
      .classList.replace("text-blue-500", "text-gray-500");
    filterBooks();
  });

  // Pagination buttons
  document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      filterBooks();
    }
  });

  document.getElementById("nextPage").addEventListener("click", () => {
    const totalPages = Math.ceil(allBooks.length / booksPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      filterBooks();
    }
  });

  // User menu toggle
  document.getElementById("userMenuButton").addEventListener("click", () => {
    document.getElementById("userMenu").classList.toggle("hidden");
  });

  // Close user menu when clicking outside
  document.addEventListener("click", (event) => {
    const container = document.getElementById("userMenuContainer");
    if (!container.contains(event.target)) {
      document.getElementById("userMenu").classList.add("hidden");
    }
  });

  // Sync button
  document.getElementById("syncButton").addEventListener("click", async () => {
    document.getElementById("status").classList.remove("hidden");
    await loadCategories();
    setupRealtimeUpdates();
    showToast("Đã đồng bộ dữ liệu thành công!", "success");
  });

  // View mode toggle button
  document.getElementById("viewModeButton").addEventListener("click", () => {
    if (viewMode === "grid") {
      viewMode = "list";
      document
        .getElementById("listViewButton")
        .classList.replace("text-gray-500", "text-blue-500");
      document
        .getElementById("gridViewButton")
        .classList.replace("text-blue-500", "text-gray-500");
    } else {
      viewMode = "grid";
      document
        .getElementById("gridViewButton")
        .classList.replace("text-gray-500", "text-blue-500");
      document
        .getElementById("listViewButton")
        .classList.replace("text-blue-500", "text-gray-500");
    }
    filterBooks();
  });
});

window.addEventListener("beforeunload", () => {
  if (unsubscribe) {
    unsubscribe();
  }
});

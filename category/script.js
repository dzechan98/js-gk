// Firebase Configuration (Replace with your config)
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

// DOM Elements
const categoryForm = document.getElementById("categoryForm");
const categoryId = document.getElementById("categoryId");
const categoryName = document.getElementById("categoryName");
const saveCategory = document.getElementById("saveCategory");
const categoriesContainer = document.getElementById("categoriesContainer");
const booksModal = document.getElementById("booksModal");
const bookForm = document.getElementById("bookForm");
const selectedCategoryId = document.getElementById("selectedCategoryId");
const bookTitle = document.getElementById("bookTitle");
const bookAuthor = document.getElementById("bookAuthor");
const booksContainer = document.getElementById("booksContainer");

// Real-time Categories Listener
db.collection("categories").onSnapshot((snapshot) => {
  categoriesContainer.innerHTML = "";
  snapshot.forEach((doc) => {
    const category = doc.data();
    const categoryElement = `
        <div class="flex justify-between items-center bg-gray-50 p-4 rounded-md">
            <span class="font-medium">${category.name}</span>
            <div class="space-x-2">
                <button onclick="showBooks('${doc.id}', '${category.name}')" 
                        class="text-green-600 hover:text-green-800">
                    View Books
                </button>
                <button onclick="editCategory('${doc.id}')" 
                        class="text-blue-600 hover:text-blue-800">
                    Edit
                </button>
                <button onclick="deleteCategory('${doc.id}')" 
                        class="text-red-600 hover:text-red-800">
                    Delete
                </button>
            </div>
        </div>
    `;
    categoriesContainer.innerHTML += categoryElement;
  });
});

// Category Form Submit
categoryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = categoryName.value.trim();

  if (categoryId.value) {
    // Update existing category
    await db.collection("categories").doc(categoryId.value).update({ name });
  } else {
    // Add new category
    await db.collection("categories").add({ name });
  }

  categoryForm.reset();
  categoryId.value = "";
});

// Edit Category
async function editCategory(id) {
  const doc = await db.collection("categories").doc(id).get();
  categoryId.value = id;
  categoryName.value = doc.data().name;
  saveCategory.textContent = "Update Category";
  categoryName.focus();
}

// Delete Category
async function deleteCategory(id) {
  if (confirm("Delete this category and all its books?")) {
    // Delete category
    await db.collection("categories").doc(id).delete();

    // Delete associated books
    const booksSnapshot = await db
      .collection("books")
      .where("categoryId", "==", id)
      .get();
    booksSnapshot.forEach(async (doc) => {
      await db.collection("books").doc(doc.id).delete();
    });
  }
}

// Show Books Modal
function showBooks(categoryId, categoryName) {
  booksModal.classList.remove("hidden");
  document.getElementById("modalCategoryName").textContent = categoryName;
  selectedCategoryId.value = categoryId;

  // Load books
  db.collection("books")
    .where("categoryId", "==", categoryId)
    .onSnapshot((snapshot) => {
      booksContainer.innerHTML = "";
      snapshot.forEach((doc) => {
        const book = doc.data();
        const bookElement = `
            <div class="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                <div>
                    <span class="font-medium">${book.title}</span>
                    <span class="text-gray-600 ml-2">by ${book.author}</span>
                </div>
                <button onclick="deleteBook('${doc.id}')" 
                        class="text-red-600 hover:text-red-800">
                    Delete
                </button>
            </div>
        `;
        booksContainer.innerHTML += bookElement;
      });
    });
}

// Add Book
bookForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  await db.collection("books").add({
    title: bookTitle.value.trim(),
    author: bookAuthor.value.trim(),
    categoryId: selectedCategoryId.value,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  bookForm.reset();
});

// Delete Book
async function deleteBook(id) {
  if (confirm("Delete this book?")) {
    await db.collection("books").doc(id).delete();
  }
}

// Close Modal
function closeBooksModal() {
  booksModal.classList.add("hidden");
  booksContainer.innerHTML = "";
}

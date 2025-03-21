import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
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

// Fetch and display orders
async function loadOrders() {
  // const queryUser = query(collection(db, 'users'), where('e-mail', '==', localStorage.getItem('currentUser')));
  const queryUser = query(
    collection(db, "users"),
    where(
      "email",
      "==",
      localStorage
        .getItem("currentUser")
        .substr(1, localStorage.getItem("currentUser").length - 2)
    )
  );

  const userSnapShot = await getDocs(queryUser);
  let userId;

  console.log(userSnapShot.empty);
  userSnapShot.forEach((doc) => {
    userId = doc.id;
  });

  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, where("userId", "==", userId)); // Filter orders by user ID
  const querySnapshot = await getDocs(q);

  const orderList = document.getElementById("orderList");
  orderList.innerHTML = "";

  if (querySnapshot.empty) {
    orderList.innerHTML = `
          <tr>
            <td colspan="6" class="p-4 text-center text-gray-500">
              Không có đơn hàng nào
            </td>
          </tr>
        `;
    return;
  }

  querySnapshot.forEach((doc) => {
    const order = doc.data();
    orderList.innerHTML += `
          <tr class="hover:bg-gray-50">
            <td class="p-3">${doc.id}</td>
            <td class="p-3">
              <div class="flex flex-col">
                ${order.items
                  .map(
                    (item) => `
                  <div class="flex items-center mb-2">
                    <img src="${item.imageUrl}" alt="${item.title}" 
                         class="w-8 h-12 object-cover mr-2">
                    <div>
                      <p class="text-sm">${item.title}</p>
                      <p class="text-xs text-gray-500">Số lượng: ${item.quantity}</p>
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </td>
            <td class="p-3">${formatPrice(order.total)}</td>
            <td class="p-3">
              <span class="px-2 py-1 text-sm rounded-full ${
                order.status === "Đã hoàn thành"
                  ? "bg-green-100 text-green-600"
                  : order.status === "Đang xử lý"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-red-100 text-red-600"
              }">
                ${order.status}
              </span>
            </td>
            <td class="p-3">${new Date(
              order.createdAt?.toDate()
            ).toLocaleString()}</td>
            <td class="p-3 text-center">
              <button onclick="viewOrderDetails('${doc.id}')" 
                      class="text-blue-500 hover:text-blue-600">
                <i class="fas fa-eye"></i>
              </button>
            </td>
          </tr>
        `;
  });
}

// View order details
window.viewOrderDetails = (orderId) => {
  // Redirect to order details page or show a modal
  alert(`Xem chi tiết đơn hàng: ${orderId}`);
};

// Format price
function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

// Initialize
document.addEventListener("DOMContentLoaded", loadOrders);

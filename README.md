# GharDrop Nepal 🏠🚀 
**MERN-Stack Hyper-local Quick-Commerce Platform**

GharDrop Nepal is a high-performance web application designed for **15-minute deliveries**. It features a robust multi-user ecosystem connecting Customers, Vendors, and Delivery Partners through a real-time, responsive interface tailored for the Nepalese market.

---

## 🌟 Key Features

### 👤 Customer Experience
* **Responsive UI:** Optimized for seamless browsing on mobile, tablet, and desktop.
* **Quick Commerce:** Purchase daily essentials (groceries, milk, eggs) with ease.
* **Live Order Tracking:** Real-time visual updates on the delivery boy's location using **Socket.io**.
* **15-Minute Fulfillment:** Algorithm-driven logic to connect users with the nearest available vendor.

### 🏪 Vendor Portal
* **Shop Onboarding:** Digitalize local brick-and-mortar stores.
* **Inventory Management:** Add, edit, and manage products and stock levels.
* **Order Dashboard:** Instant notifications for incoming orders.

### 🚴 Delivery Ecosystem
* **Rider Registration:** A dedicated portal for delivery boys to register and start working.
* **Job Management:** Real-time job alerts and navigation support.
* **Status Updates:** Transition orders from "Picked Up" to "Delivered" with live syncing.

---

## 🛰️ Real-Time Engine (Socket.io)
The "Live Tracking" feature is powered by WebSockets to ensure zero-latency updates:
* **The Workflow:** When a Delivery Boy moves, the client emits a `location-update` event.
* **The Room Logic:** The Node.js server joins the Customer and Delivery Boy into a private "Order Room."
* **The Result:** The Customer sees the delivery icon move on their map in real-time without a page refresh.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Real-time** | **Socket.io** |
| **Auth** | JSON Web Tokens (JWT) & Bcrypt |

---

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/SurajGhimire29/Final-Year-Project-GharDropNepal.git](https://github.com/SurajGhimire29/Final-Year-Project-GharDropNepal.git)

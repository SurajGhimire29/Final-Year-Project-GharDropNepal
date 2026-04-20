# GharDrop Nepal 🏠🚀 
**MERN-Stack Hyper-local Quick-Commerce Platform**

GharDrop Nepal is a high-performance web application designed for **15-minute deliveries**. It features a robust multi-user ecosystem connecting Customers, Vendors, and Delivery Partners through a real-time, responsive interface tailored for the Nepalese market.

---

## 🌟 The Ecosystem (Role-Based Access)

### 👤 Customer
* **15-Minute Fulfillment:** Algorithm-driven logic to connect users with the nearest available vendor.
* **Live Order Tracking:** Real-time visual updates on the delivery boy's location using **Socket.io**.
* **Payment Flexibility:** Integrated **Khalti** for online payments and Cash on Delivery (COD).

### 🏪 Vendor (The Merchant)
* **Shop Digitalization:** A dedicated portal for local shops to manage inventory and stock levels.
* **Smart Advertising:** Vendors can request homepage banners. If their balance is low, the system allows **"Debt-based Advertising"** (marked as Unpaid).
* **Financial Ledger:** A full transaction history showing Income (+), Payouts (-), and Marketing Fees (-).

### 🚴 Delivery (The Rider)
* **Fleet Management:** Dedicated registration for riders with license verification.
* **Live Job Alerts:** Instant notifications when an order is ready for pickup.
* **Earnings Tracking:** Riders keep 95% of the delivery fee, with 5% going to the platform.

### 🛡️ Admin (The Controller)
* **System Treasury:** A high-level overview of total revenue, platform profit, and pending receivables.
* **Verification Hub:** Manual audit and approval process for new Vendors and Riders.
* **Banner Management:** Approve/Reject advertising requests with a live notification system.

---

## 💸 The Treasury Protocol (Business Logic)

The platform operates on a **Split-Revenue Model** to ensure sustainability:

1. **Vendor Sales:** The vendor receives **90%** of the item price. The platform retains **10%** as commission.
2. **Delivery Fees:** The rider receives **95%** of the delivery charge. The platform retains **5%** as a logistics fee.
3. **Banner Fees:** A fixed fee of **Rs. 500** per banner.
   - **Auto-Settlement:** If a vendor has no money, the banner is marked as "Unpaid." As soon as the vendor earns Rs. 500 from sales, the system automatically "cuts" the fee and moves it to Admin Profit.

---

## 🛰️ Technical Architecture

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Real-time** | **Socket.io** |
| **Auth** | JSON Web Tokens (JWT) & Bcrypt |
| **Storage** | Cloudinary |

---

## 🎓 Viva Defense: Key Questions & Answers

**Q: How does the live tracking work?**
> **A:** It uses Socket.io. When a rider moves, their app emits a `location-update`. The server broadcasts this to the customer's "Order Room." The customer's map updates in real-time without refreshing the page.

**Q: How do you handle vendor advertising if they have no money?**
> **A:** I implemented a **Debt Management System**. The banner is approved but marked as "Unpaid." The fee remains as a "Pending Receivable" for the Admin and a "Liability" for the Vendor. The system automatically settles this debt once the vendor makes sales.

**Q: Is the system secure?**
> **A:** Yes. We use **JWT (JSON Web Tokens)** stored in HttpOnly cookies for session management, and **Bcrypt** for password hashing. We also use Role-Based Access Control (RBAC) to ensure a Vendor cannot access the Admin panel.

**Q: Why choose the MERN stack?**
> **A:** MERN allows for a unified JavaScript ecosystem. Using JSON throughout the stack (from MongoDB to React) makes development faster and allows for high-performance data handling.

---

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SurajGhimire29/Final-Year-Project-GharDropNepal.git
   ```
2. **Server Setup:**
   - `cd server`
   - `npm install`
   - Create `.env` file with Mongo URI and Cloudinary keys.
   - `npm start`
3. **Client Setup:**
   - `cd client`
   - `npm install`
   - `npm run dev`

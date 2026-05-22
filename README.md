# GateEase - Premium Apartment Management System 🏢✨

GateEase is a modern digital platform designed to streamline daily operations and management tasks in residential complexes and hostels. It replaces inefficient manual processes with a secure, centralized system for residents, administrators, and security personnel.

## 🛠 Tech Stack
* **Frontend:** React.js, Tailwind CSS, Recharts, Lucide Icons
* **Backend:** Node.js, Express.js, node-cron
* **Database:** MySQL

---

## 👥 Team Members & Contributions

| Student ID | Name                    | Core Responsibility                                                   |
|:-----------|:------------------------|:----------------------------------------------------------------------|
| IT24102783 | Methdam G.V.M           | Resident & Unit Management, User Management, UI/UX Design, AI Chatbot |
| IT24100451 | Mudaligama K.H.C        | Security & Visitor Management                                         |
| IT24100216 | De Silva W.H.K.S        | Payment & Billing Management                                          |
| IT24102713 | Ranathunga R.M.C.M.B    | Facility Booking & Capacity Management                                |
| IT24103988 | Wikramarathna W.G.S.A.S | Complaint & Maintenance Management                                    |

<br>

## 🚀 Key Features & Functionalities

| Module / Feature | Functionality Description | Developed By |
| :--- | :--- | :--- |
| **🎨 Core UI/UX Design** | Designed and developed the complete frontend layout using modern aesthetics (Glassmorphism), animations, and responsive components. | **Methdam G.V.M** |
| **🤖 AI Chatbot Integration** | Integrated an intelligent chatbot to assist residents and improve overall user experience across the portal. | **Methdam G.V.M** |
| **🏢 Resident & Unit Management** | Full CRUD operations for residents, role-based access control, unit assignment, and seamless profile management. | **Methdam G.V.M** |
| **🔐 Visitor Management** | Dynamic QR code generation and scanning for visitors. | Mudaligama K.H.C |
| **✅ Access Approvals** | Real-time manual approval/rejection system for residents to authorize unexpected visitors. | Mudaligama K.H.C |
| **💳 Automated Billing** | Auto-generation of maintenance bills on the 1st of every month using scheduled Cron Jobs. | De Silva W.H.K.S |
| **🧾 Payment Processing** | Manual invoice generation, payment tracking, and Admin approval/rejection workflow for transactions. | De Silva W.H.K.S |
| **📊 Financial Analytics** | Visual data representation (Charts) comparing paid vs. pending expenses. | De Silva W.H.K.S |
| **📅 Smart Facility Booking** | Time-based facility reservations with validation for opening/closing hours and overlapping bookings. | Ranathunga R.M.C.M.B |
| **⛔ Maintenance Blackouts** | Ability for admins to block specific dates/times for facility maintenance, preventing overlapping bookings. | Ranathunga R.M.C.M.B |
| **👥 Capacity Management** | Differentiates between 'Shared' (capacity-based) and 'Exclusive' (single-party) facility bookings. | Ranathunga R.M.C.M.B |
| **🛠️ Complaint Lodging** | Residents can submit maintenance issues with specific categories, priority levels, and descriptions. | Wikramarathna W.G.S.A.S |
| **💬 Issue Tracking & Updates** | A built-in thread for admins/staff to post status updates and images regarding ongoing complaints. | Wikramarathna W.G.S.A.S |
| **⭐ Feedback System** | Residents can rate and submit feedback on maintenance tasks once they are marked as 'Resolved'. | Wikramarathna W.G.S.A.S |
| **📈 Staff Performance Analytics** | Admin dashboard tracking total resolved issues, average ratings, and individual staff performance metrics. | Wikramarathna W.G.S.A.S |

---

## ⚙️ Installation Guide

### Prerequisites
* Node.js installed
* MySQL server installed and running (XAMPP / MySQL Workbench)

### Steps
1. **Clone the repository:**
   ```bash
   git clone <your_repository_link>
   cd GateEase

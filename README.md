# Supermarket Web Application

**Seminar Project for Database Systems II**
Faculty of Electrical Engineering and Informatics, University of Pardubice
Team: Aronov Oleksandr, Streblychenko Andrii

---

## Table of Contents

* [Overview](#overview)
* [Tech Stack](#tech-stack)
* [Features & Modules](#features--modules)
* [User Roles & Permissions](#user-roles--permissions)
* [Installation & Setup](#installation--setup)
* [Usage](#usage)
* [Database Schema Highlights](#database-schema-highlights)
* [Contributing](#contributing)
* [Authors](#authors)

---

## Overview

This project implements an end-to-end web application for managing a supermarket’s core business processes:

* **Customers** and **orders**
* **Products**, **categories**, and **inventory**
* **Employees**, **positions**, and **salary indexing**
* **Payments** (cash, card, invoice)
* **Real-time alerts** on low stock

Built as a team seminar for the course **Databázové systémy II**, it demonstrates a full cycle from database design through backend services to a modern frontend interface.

---

## Tech Stack

| Layer           | Technology                        |
| --------------- | --------------------------------- |
| **Backend**     | Java 17, Spring Boot              |
| **Frontend**    | React.js, npm                     |
| **Database**    | Oracle Database (PL/SQL, SQL)     |
| **Auth & API**  | Spring Security, REST endpoints   |
| **Env & Tools** | IntelliJ IDEA, VS Code, Cisco VPN |

---

## Features & Modules

### 1. Customer Module

* **Browse Products**: View product catalog by category
* **Create Orders**: Add items to cart from a JSON payload
* **Order History**: See past orders and statuses

### 2. Employee Module

* **Order Management**: Update order statuses (“Processing”, “Complete”)
* **Hierarchy View**: Display reporting structure and wages
* **Salary Indexing**: Adjust salaries by percentage ranges

### 3. Administrator Module

* **Admin Panel**: Full CRUD on all entities (products, orders, users, employees)
* **User & Employee Management**: Create/update/delete users and employees
* **Role Assignment**: Grant roles (customer, employee, admin)
* **Wage Indexing**: Trigger batch salary updates

### 4. Shared

* **Login & Registration**: Secure authentication with role-based access
* **Audit Logging**: Triggers log all inserts/updates/deletes for key tables
* **Data Validation**: PL/SQL triggers enforce email format, non-negative prices, etc.

---

## User Roles & Permissions

| Role         | Permissions                                                     |
| ------------ | --------------------------------------------------------------- |
| **Admin**    | Full access to all modules; manage users/employees, index wages |
| **Employee** | View/edit user order statuses; view employee hierarchy & wages  |
| **Customer** | Browse products; create and track own orders                    |
| **Public**   | Read-only access to product catalog                             |

Default credentials:

* **Admin**: `admin@email.com` / `123456789`
* **Employee**: `employee@email.com` / `123456789`
* **User**: `user@mail.com` / `123456789`

---

## Installation & Setup

### Prerequisites

* Oracle Database with PL/SQL support
* Java 17+, Maven
* Node.js 20.13.1+, npm 10.9.0
* IntelliJ IDEA & VS Code
* Cisco AnyConnect VPN (for database access)

### Backend

1. Clone repository and open in IntelliJ IDEA.
2. Configure `application.properties` for Oracle JDBC URL, user, and password.
3. Run `BackendApplication.java` to start Spring Boot on port `8080`.

### Frontend

```bash
cd react-frontend
npm install
npm start
```

This launches the UI on `http://localhost:3000`.

---

## Usage

1. **Connect to VPN**, then start both backend and frontend.

2. **Register** or **login** with one of the user roles.

3. Navigate via the top-level menu to access:

   * Products, Orders, My Orders
   * Employee → Orders & Hierarchy
   * Admin Panel → Data management & user/employee tools

4. **Logout** using the button in the top-right corner.

---

## Database Schema Highlights

* **Tables**: CUSTOMER, USER, ORDER, PRODUCT, CATEGORY, SUPERMARKET, EMPLOYEE, POSITION, PAYMENT, LOG
* **Views**:

  * `ORDER_DETAILS_VIEW` – aggregated order info (customer, total price)
  * `EMPLOYEE_INFO_VIEW` – combined employee & manager details
  * `PRODUCT_VIEW`, `USER_VIEW`, `USER_WITH_ROLE`
* **Functions & Procedures**:

  * `AVG_PERSONAL_SALARY`, `AVG_SUBORDINATE_SALARY`
  * `FUNC_ADD_ORDER_ITEMS` (JSON→order items)
  * `PROC_PROCESS_ORDER`, `PROC_LIST_USER_ORDERS_EXPLICIT`
  * `PROC_USER_CUD`, `PROC_ZAKAZNIK_CUD`
* **Triggers**: Data validation and audit logging on INSERT/UPDATE/DELETE
* **Sequences**: Unique ID generators for all primary key columns

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit & push:

   ```bash
   git commit -m "Add feature"
   git push origin feature/YourFeature
   ```
4. Open a Pull Request for review.

Please follow existing code conventions and include relevant tests for new functionality.

---

## Authors

* **Oleksandr Aronov**
* **Andrii Streblychenko**

University of Pardubice — Seminar “Databázové systémy II”, December 2024

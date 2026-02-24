# Splitwise MVP Backend

This project is a simple backend implementation of a Splitwise-like application built using Node.js, Express, MySQL, and Sequelize.

The goal of this project is to implement the core features of Splitwise — allowing users to create accounts, add shared expenses, and calculate balances between users.

This was developed as part of a coding round assignment focusing on backend fundamentals and database design.

---

## What This Project Covers

This MVP allows users to:

- Create an account
- View and update profile
- Add shared expenses
- Update expenses (only by the payer)
- View balances with other users

The splitting logic is simple and equal among all members. No percentage splits or advanced settlement logic are implemented, as this is intentionally kept minimal for MVP scope.

---

## Tech Stack Used

- Node.js
- MySQL
- Sequelize ORM

No authentication middleware is implemented. The `userId` is assumed to be passed in request headers for simplicity.

---

## Project Structure
Splitwise_Mvp/
│
├── config/
│ └── database.js
│
├── controllers/
│ ├── user.controller.js
│ ├── expense.controller.js
│ └── balance.controller.js
│
├── models/
│ ├── user.model.js
│ ├── expense.model.js
│ └── expenseMember.model.js
│
├── routes/
│ ├── user.routes.js
│ ├── expense.routes.js
│ └── balance.routes.js
│
├── postman/
│ └── Splitwise-MVP.postman_collection.json
│
├── app.js
├── server.js
└── README.md

The structure is kept simple using a basic MVC pattern.

---

## Database Design

There are three main tables:

### Users
Stores user information like name, email, password, and default currency.

### Expenses
Stores expense details such as description, total amount, and who paid.

### ExpenseMembers
Mapping table used for splitting expenses among users.
This is required because:
- One expense can have multiple users
- One user can be part of multiple expenses
So it forms a many-to-many relationship.

Balances are calculated dynamically from expenses instead of storing them in a separate table.

---

## Setup Instructions

1. Clone the repository
git clone https://github.com/kdurgamaheshm/Splitwise_Mvp.git
cd Splitwise_Mvp
2. Install dependencies

3. Create a `.env` file in the root folder
DB_NAME=splitwise_mvp
DB_USER=root
DB_PASS=your_mysql_password
DB_HOST=127.0.0.1
PORT=3000

4. Create the database in MySQL
CREATE DATABASE splitwise_mvp;

5. Start the server
You should see:


Database connected...
Server running on port 3000
---

## API Endpoints

### Users

POST /users  
Create a new user

Example Body:

{
"name": "Mahesh",
"email": "mahesh@gmail.com
",
"password": "1234",
"currency": "INR"
}


---

### Add Expense

POST /expenses  
Headers:

userId: 1


Body:

{
"description": "Dinner",
"totalAmount": 1200,
"memberIds": [1,2,3]
}


The total amount is split equally among members.

---

### Update Expense

PUT /expenses/:id  
Only the user who paid can update the expense.

---

### View Balances

GET /balances  
Headers:

userId: 1


Example Response:

{
"userId": 1,
"balances": [
{
"otherUserId": 2,
"amountOwed": 300
}
]
}


If the current user paid, others owe them.  
If someone else paid, the current user owes them.

---

## Postman Collection

A Postman collection is included in the `postman/` folder.

You can import it into Postman to test all APIs easily.

---

## Assumptions Made

- No authentication layer (userId passed in headers)
- Equal splitting only
- No debt simplification
- No email report implementation (can be added later)
- No production-level validations

---

## Notes

This project focuses on:

- Relational database design
- Handling many-to-many relationships
- Writing clean REST APIs
- Implementing business logic clearly
- Keeping the solution simple and practical

It is intentionally not over-engineered.

---

## Final Thoughts

This implementation demonstrates the core backend logic required for a Splitwise-like system using a clean and beginner-friendly approach.

If extended further, we could add:
- Percentage-based splits
- Settlement tracking
- Monthly email reports
- JWT authentication
- Currency conversion

But for MVP scope, the current implementation covers the required functionality.

---

Thank you for reviewing this project.

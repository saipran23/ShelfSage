
# 📚 OpenShelf

### Personal Book Knowledge and Reading Progress Tracker

OpenShelf is a full-stack web application that enables users to discover books, build a personal digital library, track reading progress, assign ratings, and create rich text notes and reviews.

The application integrates with the Open Library API to fetch real-time book data and uses PostgreSQL for persistent storage. It provides a clean, modern UI and a structured backend following industry best practices.

This project demonstrates strong competency in full-stack development, database design, RESTful routing, server-side rendering, and API integration.

---

*(Add later if deployed)*

```
http://localhost:3000
```

---

# 📸 Application Screenshots

## Dashboard

Displays reading statistics, currently reading books, and recently added books.
<img width="1919" height="936" alt="image" src="https://github.com/user-attachments/assets/62295c0f-030e-46a6-9832-54fc5a46804d" />
<img width="1919" height="941" alt="image" src="https://github.com/user-attachments/assets/3ec7fec6-0ded-4012-88e6-df37afdd636c" />


## Discover Page

Search books using Open Library API and add them to personal library.
<img width="1919" height="941" alt="image" src="https://github.com/user-attachments/assets/8b1250ed-4327-493b-9306-f05bd7780964" />
<img width="1919" height="940" alt="image" src="https://github.com/user-attachments/assets/2bd85d5f-86d4-4f29-a1b3-0c7b1b7d9513" />


## Library Page

Displays all user-added books with status, rating, and quick access to details.
<img width="1903" height="939" alt="image" src="https://github.com/user-attachments/assets/22297239-fb74-4360-aacd-081a27a37a04" />

## Book Details Page

View book information, update reading status, assign rating, and manage notes.
<img width="1888" height="904" alt="image" src="https://github.com/user-attachments/assets/a1f232fa-ffe0-4ceb-824c-3f4cd7d19135" />

## Notes Editor

Rich text editor powered by Quill supporting formatted notes.
<img width="1919" height="943" alt="image" src="https://github.com/user-attachments/assets/28bf13e0-0b49-4e78-a446-722160f19c94" />

---

# 🎯 Key Features

## 1. Dashboard System

Provides analytical insights into reading activity.

Features:

* Total books count
* Completed books count
* Currently reading count
* Average rating calculation
* Recently added books list
* Currently reading books display

Database aggregation queries are optimized using PostgreSQL functions such as:

```
COUNT()
AVG()
COALESCE()
ROUND()
ORDER BY
LIMIT
```

---

## 2. Book Discovery via External API

Integrated with Open Library REST API.

Users can:

* Search books by title or author
* View cover image, title, and author
* Automatically fetch book description
* Add books to personal library

API endpoint used:

```
https://openlibrary.org/search.json
```

Book details endpoint:

```
https://openlibrary.org/works/{work_key}.json
```

---

## 3. Personal Library Management

Users can maintain a digital collection of books.

Features include:

* Add books to library
* View all books in card layout
* Search books within library
* View reading status
* View ratings
* Navigate to detailed book view

Search is implemented using PostgreSQL case-insensitive matching:

```
ILIKE '%search%'
```

---

## 4. Reading Progress Tracking

Each book includes reading state management:

```
Planned
Currently Reading
Completed
```

Status updates are persisted in PostgreSQL and reflected across the dashboard.

---

## 5. Rating System

Users can rate books from:

```
0 to 5 Stars
```

Ratings are used to calculate average rating dynamically.

---

## 6. Rich Text Notes System (Quill Integration)

Users can create unlimited notes per book.

Features:

* Rich text formatting
* Multiple notes per book
* Edit existing notes
* Cancel editing safely
* Persistent storage in PostgreSQL

Quill editor supports:

* Bold, Italic, Underline
* Headings
* Lists
* Alignment
* Links
* Media embedding

---

## 7. Robust Error Handling

Application handles failures gracefully:

* API failures
* Database errors
* Invalid book IDs
* Empty search results

Users receive feedback and safe redirection.

---

# 🏗 System Architecture

```
Client (Browser)
        │
        │ HTTP Requests
        ▼
Express.js Server
        │
        ├── Open Library API
        │
        └── PostgreSQL Database
```

Architecture follows MVC-inspired separation:

```
Routes → Logic → Database → View (EJS)
```

---

# 🛠 Technology Stack

## Frontend

* HTML5
* CSS3
* EJS (Server-side templating)
* Quill Rich Text Editor

## Backend

* Node.js
* Express.js

## Database

* PostgreSQL

## API Integration

* Open Library REST API

## Libraries Used

```
express
pg
axios
body-parser
quill
```

---

# 📁 Project Structure

```
OpenShelf/
│
├── public/
│   ├── styles/
│   │    main.css
│   ├── images/
│        default-cover.png
│
├── views/
│   ├── partials/
│   │     header.ejs
│   │     footer.ejs
│   │
│   ├── dashboard.ejs
│   ├── discover.ejs
│   ├── library.ejs
│   ├── book-details.ejs
│
├── index.js
├── package.json
└── README.md
```

---

# 🗄 Database Design

## Users Table

```
CREATE TABLE users (
 id SERIAL PRIMARY KEY,
 name TEXT NOT NULL
);
```

---

## Books Table

```
CREATE TABLE books (
 id SERIAL PRIMARY KEY,
 title TEXT NOT NULL,
 author_name TEXT,
 description TEXT,
 cover_id INTEGER,
 key TEXT UNIQUE,
 reading_status VARCHAR(20),
 rating DECIMAL,
 date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 user_id INTEGER REFERENCES users(id)
);
```

---

## Notes Table

```
CREATE TABLE notes (
 id SERIAL PRIMARY KEY,
 book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
 note TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# ⚙️ Installation Guide (Step-by-Step)

## Step 1: Clone Repository

```
git clone https://github.com/saipran23/OpenShelf.git
cd OpenShelf
```

---

## Step 2: Install Dependencies

```
npm install
```

---

## Step 3: Setup PostgreSQL Database

Login to PostgreSQL:

```
psql -U postgres
```

Create database:

```
CREATE DATABASE OpenShelf;
```

Create tables using schema above.

---

## Step 4: Configure Database Connection

Edit file:

```
index.js
```

Update:

```
user
password
database
port
```

---

## Step 5: Run Application

```
node index.js
```

Server will start:

```
Server running on http://localhost:3000
```

---

# 🔄 Application Workflow

## Book Discovery Flow

```
User Search → Express Route → Open Library API → Display Results
```

---

## Add Book Flow

```
User Click Add →
Fetch Book Details →
Insert into PostgreSQL →
Redirect to Library
```

---

## Notes System Flow

```
User Edit Note →
Submit Form →
Update PostgreSQL →
Reload Book Details
```

---

# 🔒 Security Measures Implemented

* Parameterized SQL queries (Prevents SQL Injection)
* Input validation
* Error handling
* Safe redirects

Example:

```
db.query("SELECT * FROM books WHERE id = $1", [id])
```

---

# 📈 Performance Optimizations

* LIMIT queries for dashboard
* Indexed primary keys
* Efficient joins
* Server-side rendering

---

# 💡 Skills Demonstrated

This project demonstrates expertise in:

Full-Stack Development
REST API Integration
Database Design
Backend Development
Server-Side Rendering
Error Handling
Rich Text Editor Integration
MVC Architecture Concepts
Professional UI/UX Implementation

---

# 🚀 Future Improvements

Planned enhancements include:

User authentication (Login / Signup)
Multi-user system
Delete books
Delete notes
Pagination
Deployment (Render / Railway / AWS)
REST API version

---

# 🧪 Testing Scenarios Covered

* Add book
* Duplicate prevention
* Update status
* Add notes
* Edit notes
* Search functionality
* Error conditions

---

# 👨‍💻 Author

ALCHURI SAIPRANEETH REDDY

Full-Stack Developer

GitHub:
[(Add your GitHub link)(https://github.com/saipran23)

LinkedIn:
(https://www.linkedin.com/in/alchuri-sai-praneeth-reddy/)

---

# ⭐ Why This Project is Valuable

This project reflects real-world backend architecture, database design, and frontend integration. It demonstrates the ability to build scalable, maintainable, and professional full-stack applications.


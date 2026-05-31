CREATE TABLE users (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
role ENUM('admin','petugas','mahasiswa') DEFAULT 'mahasiswa',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
description TEXT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
id INT AUTO_INCREMENT PRIMARY KEY,
title VARCHAR(255) NOT NULL,
author VARCHAR(255) NOT NULL,
publisher VARCHAR(255) NULL,
isbn VARCHAR(20) UNIQUE NULL,
published_year INT NULL,
description TEXT NULL,
cover_image LONGBLOB NULL,
category_id INT,
stock INT DEFAULT 0,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE borrowings (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT,
book_id INT,
borrow_date DATE,
due_date DATE NULL,
status ENUM('dipinjam','dikembalikan','terlambat') DEFAULT 'dipinjam',
FOREIGN KEY (user_id) REFERENCES users(id),
FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE TABLE returns (
id INT AUTO_INCREMENT PRIMARY KEY,
borrowing_id INT,
return_date DATE,
fine DECIMAL(10,2) DEFAULT 0,
FOREIGN KEY (borrowing_id) REFERENCES borrowings(id)
);

-- ================================
-- Drop Tables (falls bereits vorhanden)
-- ================================
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS inventory_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;

-- ================================
-- USERS
-- ================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    firstname VARCHAR(50),
    lastname VARCHAR(50),
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    birthday DATE,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- CARTS
-- ================================
CREATE TABLE carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

-- ================================
-- ORDERS
-- ================================
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

-- ================================
-- ITEMS
-- ================================
CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(255),
    pictures JSON,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'Furniture',
    order_id INT NULL,

    FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE SET NULL
);

-- ================================
-- INVENTORY
-- ================================
CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);


-- ================================
-- CART_ITEMS
-- ================================
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    item_id INT NOT NULL,

    FOREIGN KEY (cart_id) REFERENCES carts(id)
        ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id)
        ON DELETE CASCADE
);

-- ================================
-- INVENTORY_ITEMS
-- ================================
CREATE TABLE inventory_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_id INT NOT NULL,
    item_id INT NOT NULL,

    FOREIGN KEY (inventory_id) REFERENCES inventory(id)
        ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id)
        ON DELETE CASCADE
);

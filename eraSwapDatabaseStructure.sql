-- =====================================
-- 🗃️  ERASWAP DATABASE INITIAL SETUP
-- =====================================

CREATE DATABASE IF NOT EXISTS eraswap
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE eraswap;

-- =====================================
-- 👤 USERS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    birthday DATE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================
-- 📦 ITEMS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    picture JSON,
    price DECIMAL(10,2) NOT NULL,
    size JSON,
    description TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL,
    CONSTRAINT fk_items_users
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================
-- 🛒 Inventory TABLE (ein Warenkorb pro User)
-- =====================================
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,   
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invenotory_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================
-- 🛍 Inventory ITEMS TABLE (Items im Warenkorb)
-- =====================================
CREATE TABLE IF NOT EXISTS inventory_items (
    
    id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventoryitems_inventory
        FOREIGN KEY (inventory_id) REFERENCES inventory(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_inventoryitems_item
        FOREIGN KEY (item_id) REFERENCES items(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================
-- 📦 ORDERS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT NOT NULL,  -- User who places the order
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_users
        FOREIGN KEY (buyer_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================
-- 📦 ORDER ITEMS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_at_order DECIMAL(10,2) NOT NULL, -- snapshot of price
    CONSTRAINT fk_orderitems_orders
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_orderitems_items
        FOREIGN KEY (item_id) REFERENCES items(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================
-- 🌱 Beispiel-Daten
-- =====================================

INSERT INTO users (username, firstname, lastname, email, password_hash, birthday)
VALUES 
('eraswapper1', 'Anna', 'Müller', 'anna@example.com', 'hash123', '1999-05-15'),
('eraswapper2', 'Tom', 'Schneider', 'tom@example.com', 'hash456', '2001-08-03');

INSERT INTO inventory (user_id) VALUES (1), (2);

INSERT INTO items (name, picture, price, size, description, user_id)
VALUES
('Wooden Chair',
 JSON_ARRAY('chair1.jpg', 'chair2.jpg'),
 25.50,
 JSON_OBJECT('width',45,'height',90,'depth',40),
 'Simple wooden chair, slightly used.',
 1),
('Desk Lamp',
 JSON_ARRAY('lamp1.jpg'),
 10.00,
 JSON_OBJECT('height',35),
 'Small LED desk lamp.',
 2);

INSERT INTO inventory_items (inventory_id, item_id, quantity)
VALUES 
(1, 1, 1),
(2, 2, 2);

-- =====================================
-- CHECK
-- =====================================
SHOW TABLES;

SELECT * FROM users;
SELECT * FROM inventory;
SELECT * FROM inventory_items;
SELECT * FROM items;
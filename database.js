const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Definirea calea către fișierul bazei de date
const dbPath = path.resolve(__dirname, "data.db");

// Crearea conexiunii la baza de date
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database: " + err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

const usersTable = () => {
  const sql = `
       CREATE TABLE IF NOT EXISTS users (
       id TEXT NOT NULL UNIQUE PRIMARY KEY,
       username TEXT NOT NULL UNIQUE,
       email TEXT NOT NULL UNIQUE,
       password TEXT NOT NULL
        )
    `;
  // Execute SQL command to create table
  db.run(sql, (err) => {
    if (err) {
      console.error("Error creating users table:", err.message);
    } else {
      console.log("Users table created successfully.");
    }
  });
};
const productsTable = () => {
  const sql = `
       CREATE TABLE IF NOT EXISTS products (
       id TEXT NOT NULL UNIQUE PRIMARY KEY,
       nume TEXT NOT NULL UNIQUE,
       um TEXT NOT NULL,
       pret REAL NOT NULL,
       imagine TEXT NOT NULL
        )
    `;
  // Execute SQL command to create table
  db.run(sql, (err) => {
    if (err) {
      console.error("Error creating users table:", err.message);
    } else {
      console.log("Products table created successfully.");
    }
  });
};
const ordersTable = () => {
  const sql = `
       CREATE TABLE IF NOT EXISTS orders (
       order_id TEXT NOT NULL UNIQUE PRIMARY KEY,
       customer_name TEXT NOT NULL,
       customer_email TEXT NOT NULL,
       order_date TEXT NOT NULL,
       status TEXT NOT NULL,
       delivery_address TEXT NOT NULL,
       payment_method TEXT NOT NULL,
       products TEXT NOT NULL
 )
    `;
  // Execute SQL command to create table
  db.run(sql, (err) => {
    if (err) {
      console.error("Error creating users table:", err.message);
    } else {
      console.log("Orders table created successfully.");
    }
  });
};
usersTable();
productsTable();
ordersTable();

module.exports = db;

const express = require("express");
const db = require("./database.js");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const fs = require("fs");

// Inițializare Express
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "supersecret-scufitarosie",
    saveUninitialized: false,
    resave: false,
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

function requireAdmin(req, res, next) {
  if (req.session.user) {
    db.get(
      `SELECT * FROM users WHERE email = ?`,
      [req.session.user.email],
      (err, user) => {
        if (err) {
          console.error(err.message);
          res.status(500).send("Internal server error");
          return;
        }
        if (user && user.role === "admin") {
          next();
        } else {
          res.status(403).send("Access denied");
        }
      }
    );
  } else {
    res.redirect("/access-denied");
  }
}

// check if user is authenticated
function requireLogin(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.redirect("/login");
  }
}

//Get all products from db
app.get("/get_all_products", (req, res) => {
  const sql = `SELECT * FROM products`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Error retrieving products:", err.message);
      res.status(500).json({ error: "Error retrieving products" });
    } else {
      res.json(rows);
    }
  });
});

// Get product by id from db
app.get("/api/product/:id", (req, res) => {
  const productId = req.params.id;

  db.get("SELECT * FROM products WHERE id = ?", [productId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: "Produsul nu a fost gasit" });
    }

    res.json(row);
  });
});

// Get all orders
app.get("/api/orders", (req, res) => {
  db.all(`SELECT * FROM orders`, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
    res.json(rows);
  });
});

//Get user oders
app.get("/api/user_orders", (req, res) => {
  if (req.session.user) {
    const userEmail = req.session.user.email;
    db.all(
      `SELECT * FROM orders WHERE customer_email = ?`,
      [userEmail],
      (err, rows) => {
        if (err) {
          console.error(err.message);
          res.status(500).json({ message: "Internal server error" });
          return;
        }
        res.json(rows);
      }
    );
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Update order status
app.put("/api/orders/:id/status", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const query = `UPDATE orders SET status = ? WHERE order_id = ?`;

  db.run(query, [status, id], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
    res.json({ message: "Status comanda actualizat cu succes!" });
  });
});

// Delete an order
app.delete("/api/orders/:id", requireAdmin, (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM orders WHERE order_id = ?`;

  db.run(query, [id], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    // Check if any rows were affected
    if (this.changes === 0) {
      res.status(404).json({ message: "Comanda nu a fost gasita!" });
      return;
    }

    res.json({ message: "Comanda a fost stearsa!" });
  });
});

//Register user
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  const id = uuid.v4();

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send("Internal server error");
      return;
    }

    if (row) {
      // Redirect back to the registration form with an error message
      res.redirect("/register?error=Aceasta adresa de email exista deja!");
    } else {
      // Insert user into database
      db.run(
        "INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)",
        [id, username, email, password, "user"],
        (err) => {
          if (err) {
            res.status(400).send("Error registering user" + err);
          } else {
            res.redirect("/profile");
          }
        }
      );
    }
  });
});

app.post("/contact", (req, res) => {
  // Check if user is logged in
  if (req.session.user) {
  }
});

app.post("/checkout", (req, res) => {
  // Check if user is logged in
  if (req.session.user) {
    const { customer_name, address, payment_method, products } = req.body;
    const id = uuid.v4();
    const email = req.session.user.email;
    const order_date = new Date().toLocaleString("ro-RO");
    const email_url = "https://api.mailjet.com/v3.1/send";
    const authorization =
      "Basic NTllMTUxZWM3OGY2Y2E5N2M1NTRmNmI5M2RhMDVkMzY6MzFjZGUxZWM0YmU3ODM3N2NhYjJiYTA5NzhlNzE1NmI=";

    db.run(
      "INSERT INTO orders (order_id, customer_name, customer_email, order_date, status, delivery_address, payment_method, products) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        customer_name,
        email,
        order_date,
        "Comanda plasata",
        address,
        payment_method,
        products,
      ],
      async (err) => {
        if (err) {
          res.status(400).send("Error registering user" + err);
        } else {
          try {
            const response = await fetch(email_url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: authorization,
              },
              body: JSON.stringify({
                Messages: [
                  {
                    From: {
                      Email: "vladtabi@gmail.com",
                      Name: "Tiglametalica",
                    },
                    To: [
                      {
                        Email: email,
                        Name: customer_name,
                      },
                    ],
                    Subject: "Comanda trimisa cu succes!",
                    TextPart: "Comanda trimisa cu succes!",
                    HTMLPart: "<h3>Comanda trimisa cu succes!</h3>",
                  },
                ],
              }),
            });
            if (!response.ok) {
              //Remove from order from db if email not sent
              db.run("DELETE FROM orders WHERE order_id = ?", [id], () => {});
              throw new Error(`Response status: ${response.status}`);
            }

            const json = await response.json();

            res.redirect("/checkout_success");
          } catch (error) {
            console.error(error.message);
          }
        }
      }
    );
  } else {
    res.redirect("/login");
  }
});

// Login user
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Check if user exists in the database
  db.get(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, user) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      } else if (!user) {
        res.status(401).send("Invalid username or password");
      } else {
        // Store user in session
        req.session.user = user;
        res.redirect("/profile");
      }
    }
  );
});

//Get session data
app.get("/get-session", (req, res) => {
  // Access session data
  const sessionData = req.session;
  res.json({ session: sessionData });
});

// Define routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/products", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/products.html"));
});
app.get("/cart", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/cart.html"));
});
app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/contact.html"));
});
app.get("/checkout", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/checkout.html"));
});
app.get("/checkout_success", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/checkout_success.html"));
});
app.get("/register", (req, res) => {
  const filePath = path.join(__dirname, "public", "pages/register.html");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err.message);
      res.status(500).send("Internal server error");
      return;
    }
    const error = req.query.error ? req.query.error : "";
    const html = data.replace("{{error}}", error);
    res.send(html);
  });
});
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/login.html"));
});
app.get("/profile", requireLogin, (req, res) => {
  // Check if user is logged in
  //if (req.session.user) {
  res.sendFile(path.join(__dirname, "public", "pages/profile.html"));
  //  } else {
  //res.redirect("/login");
  //}
});
app.get("/logout", (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.redirect("/"); // Redirect to login page after logout
    }
  });
});
app.get("/product/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/product.html"));
});
app.get("/admin", requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/admin.html"));
});
app.get("/access-denied", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/access_denied.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Close db on server exit
process.on("SIGINT", () => {
  db.close();
  server.close();
});

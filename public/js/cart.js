function addToCart(productId, productName, productUm, productPrice) {
  let cart = [];
  if (sessionStorage.getItem("user")) {
    let currentUserId = JSON.parse(sessionStorage.getItem("user")).id;
    let currentUserCartKey = "cart_" + currentUserId;
    cart = JSON.parse(localStorage.getItem(currentUserCartKey) || "[]");
    console.log(cart);
    let isInCart = cart.some((item) => item.id == productId);
    if (isInCart) {
      cart.forEach((item) => {
        if (item.id == productId) {
          item.quantity++;
        }
      });
    } else {
      cart.push({
        id: productId,
        name: productName,
        um: productUm,
        price: productPrice,
        quantity: 1,
      });
    }
    localStorage.setItem(currentUserCartKey, JSON.stringify(cart));
    updateCartBadge();
    window.alert("Produs adaugat cu succes");
  } else {
    window.alert("Logheaza-te inainte sa adaugi in cos!");
  }
}

function addQuantity(productId) {
  let currentUserId = JSON.parse(sessionStorage.getItem("user")).id;
  let currentUserCartKey = "cart_" + currentUserId;
  cart = JSON.parse(localStorage.getItem(currentUserCartKey) || "[]");
  const productIndex = cart.findIndex((product) => product.id === productId);
  if (productIndex !== -1) {
    // Update the quantity of the found product
    cart[productIndex].quantity++;
  }
  localStorage.setItem(currentUserCartKey, JSON.stringify(cart));
  renderCartProducts();
}

function subtractQuantity(productId) {
  let currentUserId = JSON.parse(sessionStorage.getItem("user")).id;
  let currentUserCartKey = "cart_" + currentUserId;
  cart = JSON.parse(localStorage.getItem(currentUserCartKey) || "[]");
  const productIndex = cart.findIndex((product) => product.id === productId);
  if (productIndex !== -1) {
    // Update the quantity of the found product
    cart[productIndex].quantity--;
  }
  localStorage.setItem(currentUserCartKey, JSON.stringify(cart));
  renderCartProducts();
}

function updateQuantity(productId, newQuantity) {
  let currentUserId = JSON.parse(sessionStorage.getItem("user")).id;
  let currentUserCartKey = "cart_" + currentUserId;
  let cart = JSON.parse(localStorage.getItem(currentUserCartKey || "[]"));

  cart = cart.map((product) => {
    if (product.id === productId) {
      product.quantity = parseInt(newQuantity);
    }
    return product;
  });

  localStorage.setItem(currentUserCartKey, JSON.stringify(cart));
  renderCartProducts();
}

function removeFromCart(productId) {
  if (confirm("Sigure vrei sa stergi produsul?")) {
    let currentUserId = JSON.parse(sessionStorage.getItem("user")).id;
    let currentUserCartKey = "cart_" + currentUserId;
    cart = JSON.parse(localStorage.getItem(currentUserCartKey) || "[]");
    cart = cart.filter((product) => product.id !== productId);
    localStorage.setItem(currentUserCartKey, JSON.stringify(cart));
    updateCartBadge();
    renderCartProducts();
  }
}

function renderCartProducts() {
  const cartDiv = document.getElementById("cart");
  cartDiv.innerHTML = "";

  let currentUserId = JSON.parse(sessionStorage.getItem("user"))?.id ?? undefined;
  if (currentUserId) {
    let currentUserCartKey = "cart_" + currentUserId;
    console.log(currentUserCartKey);
    let cart = JSON.parse(localStorage.getItem(currentUserCartKey || "[]"));

    cart.forEach((product) => {
      const productDiv = document.createElement("div");
      productDiv.className = "product-item";
      productDiv.innerHTML = `
       <p>Nume: ${product.name}</p>
       <p>Pret: ${product.price}</p>
       <p>UM: ${product.um}</p>
       <p>Cantitate:  <input type="number" id="quantity-${product.id}" value="${product.quantity}" min="1" onchange="updateQuantity('${product.id}', this.value)">
           <button class="quantity-button" onclick="subtractQuantity('${product.id}')">-</button>
           <button class="quantity-button" onclick="addQuantity('${product.id}')">+</button>
       </p>
       <p>
       <button class="remove-button" onclick="removeFromCart('${product.id}')"><i class="fas fa-trash"></i></i></button>
       </p>
       <hr>
   `;
      cartDiv.appendChild(productDiv);
    });

    // Calculate and display total price
    const totalPrice = cart.reduce((total, product) => total + product.price * product.quantity, 0);
    const totalDiv = document.createElement("div");
    totalDiv.innerHTML = `<h3>Pret total: ${totalPrice.toFixed(2)}</h3>`;
    cartDiv.appendChild(totalDiv);
  }
}

function renderProducts() {
  const cartDiv = document.getElementById("cart");
  cartDiv.innerHTML = "";

  let currentUserId = JSON.parse(sessionStorage.getItem("user")).id;
  let currentUserCartKey = "cart_" + currentUserId;
  console.log(currentUserCartKey);
  let cart = JSON.parse(localStorage.getItem(currentUserCartKey || "[]"));

  cart.forEach((product) => {
    const productDiv = document.createElement("div");
    productDiv.innerHTML = `
       <p>Nume: ${product.name}</p>
       <p>Pret: ${product.price}</p>
       <p>UM: ${product.um}</p>
       <p>Cantitate: <span id="quantity-${product.id}">${product.quantity}</span>
       </p>
       <hr>
   `;
    cartDiv.appendChild(productDiv);
  });

  // Calculate and display total price
  const totalPrice = cart.reduce((total, product) => total + product.price * product.quantity, 0);
  const totalDiv = document.createElement("div");
  totalDiv.innerHTML = `<h3>Pret total: ${totalPrice.toFixed(2)}</h3>`;
  cartDiv.appendChild(totalDiv);
}

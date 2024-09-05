async function getSessionUser() {
  const response = await fetch("get-session");

  if (!response.ok) {
    const message = `Eroare: ${response.status}`;
    throw new Error(message);
  }
  const sessionData = await response.json();
  if (sessionData.session.user) {
    return sessionData.session.user;
  } else {
    return null;
  }
}

function updateCartBadge() {
  if (sessionStorage.getItem("user")) {
    let currentUserId = JSON.parse(sessionStorage.getItem("user")).id;
    let currentUserCartKey = "cart_" + currentUserId;
    cart = JSON.parse(localStorage.getItem(currentUserCartKey) || "[]");
    console.log(cart);
    document.getElementById("cartBadge").setAttribute("value", cart.length);
  }
}
window.addEventListener("headerLoaded", async function () {
  const user = await getSessionUser();
  if (user) {
    sessionStorage.setItem("user", JSON.stringify(user));
  } else {
    sessionStorage.removeItem("user");
  }
  updateCartBadge();
});

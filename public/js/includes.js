fetch("components/header.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("header").innerHTML = data;
    window.dispatchEvent(new Event("headerLoaded"));
  })
  .catch((error) => console.log("Error fetching header:", error));
fetch("components/footer.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("footer").innerHTML = data;
  })
  .catch((error) => console.log("Error fetching header:", error));

document.addEventListener("DOMContentLoaded", () => {
  fetch("/menu/menu.html")
    .then(response => response.text())
    .then(data => {
      document.body.insertAdjacentHTML("afterbegin", data);
    })
    .catch(err => console.error("Ошибка загрузки меню:", err));
});

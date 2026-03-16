document.querySelectorAll(".copy-btn").forEach(btn => {

  btn.addEventListener("click", () => {

    const code = btn.parentElement.querySelector("code").innerText;

    navigator.clipboard.writeText(code);

    btn.classList.add("copied");

    setTimeout(() => {
      btn.classList.remove("copied");
    },2000);

  });

});

// ==============================
// ADD COPY BUTTONS TO CODE BLOCKS
// ==============================

document.querySelectorAll("pre").forEach(block => {

  const button = document.createElement("button");
  button.className = "copy-btn";

  button.innerHTML = `

  <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18">
  <path fill="currentColor" d="M16 1H8v2H3v19h18V3h-5V1zm0 4h3v15H5V5h3v2h8V5zm-6-2h4v2h-4V3z"/>
  </svg>

  <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18">
  <path fill="currentColor" d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z"/>
  </svg>

  `;

  block.appendChild(button);

  button.addEventListener("click", () => {

    const code = block.querySelector("code").innerText;

    navigator.clipboard.writeText(code);

    button.classList.add("copied");

    setTimeout(() => {
      button.classList.remove("copied");
    }, 2000);

  });

});



// ==============================
// THEME TOGGLE
// ==============================

const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {

  const body = document.body;

  const currentTheme = body.getAttribute("data-theme");

  const nextTheme = currentTheme === "light" ? "dark" : "light";

  body.setAttribute("data-theme", nextTheme);

  localStorage.setItem("theme", nextTheme);

});


// Load saved theme

const savedTheme = localStorage.getItem("theme");

if(savedTheme){
  document.body.setAttribute("data-theme", savedTheme);
}
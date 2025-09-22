document.addEventListener("DOMContentLoaded", () => {
  // ---------- Utils ----------
  function isEmail(str) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  }

  function clearErrors(rootEl) {
    if (!rootEl) return;
    rootEl.querySelectorAll(".error").forEach((el) => (el.textContent = ""));
    rootEl
      .querySelectorAll("[aria-invalid='true']")
      .forEach((el) => el.setAttribute("aria-invalid", "false"));
  }

  function showError(input, message) {
    if (!input) return;
    let errorEl = input.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains("error")) {
      errorEl = document.createElement("div");
      errorEl.className = "error";
      input.insertAdjacentElement("afterend", errorEl);
    }
    input.setAttribute("aria-invalid", "true");
    errorEl.textContent = message;
  }

  function attachLiveClear(input) {
    if (!input || input.dataset._livebound) return;
    input.addEventListener("input", () => {
      const next = input.nextElementSibling;
      if (next && next.classList.contains("error")) next.textContent = "";
      input.setAttribute("aria-invalid", "false");
    });
    input.dataset._livebound = "1";
  }

  // ---------- LOGIN (index.html) ----------
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    const loginName = document.getElementById("loginName");
    const loginPassword = document.getElementById("loginPassword");

    [loginName, loginPassword].forEach(attachLiveClear);

    loginForm.addEventListener("submit", (e) => {
      let valid = true;
      clearErrors(loginForm);

      if (!loginName || loginName.value.trim() === "") {
        showError(loginName, "Username is required");
        valid = false;
      }

      if (!loginPassword || loginPassword.value.trim() === "") {
        showError(loginPassword, "Password is required");
        valid = false;
      }

      e.preventDefault();
      if (!valid) return;

      if (typeof window.doLogin === "function") {
        window.doLogin();
      } else {
        const msg = document.getElementById("loginResult");
        if (msg) msg.textContent = "Login function is unavailable.";
        console.error("doLogin is not defined");
      }
    });
  }

  // ---------- SIGNUP (signup.html) ----------
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    const suFirst = document.getElementById("firstName");
    const suLast = document.getElementById("lastName");
    const suName = document.getElementById("signupUsername");
    const suEmail = document.getElementById("signupEmail");
    const suPass = document.getElementById("signupPassword");
    const suConfirm = document.getElementById("signupConfirm");

    [suFirst, suLast, suName, suEmail, suPass, suConfirm].forEach(attachLiveClear);

    signupForm.addEventListener("submit", (e) => {
      let valid = true;
      clearErrors(signupForm);

      if (!suFirst || suFirst.value.trim() === "") {
        showError(suFirst, "First name is required");
        valid = false;
      }

      if (!suLast || suLast.value.trim() === "") {
        showError(suLast, "Last name is required");
        valid = false;
      }

      if (!suName || suName.value.trim() === "") {
        showError(suName, "Username is required");
        valid = false;
      }

      if (!suEmail || suEmail.value.trim() === "") {
        showError(suEmail, "Email is required");
        valid = false;
      } else if (!isEmail(suEmail.value.trim())) {
        showError(suEmail, "Invalid email format");
        valid = false;
      }

      if (!suPass || suPass.value.trim() === "") {
        showError(suPass, "Password is required");
        valid = false;
      }

      if (suConfirm) {
        if (suConfirm.value.trim() === "") {
          showError(suConfirm, "Please confirm your password");
          valid = false;
        } else if (suPass && suPass.value !== suConfirm.value) {
          showError(suConfirm, "Passwords do not match");
          valid = false;
        }
      }

      e.preventDefault();
      if (!valid) return;

      if (typeof window.doSignup === "function") {
        window.doSignup();
      } else {
        const msg = document.getElementById("signupResult");
        if (msg) msg.textContent = "Signup function is unavailable.";
        console.error("doSignup is not defined");
      }
    });
  }

  // ---------- ADD CONTACT (color.html — no <form>, button id addColorButton) ----------
  const addBtn = document.getElementById("addColorButton");
  if (addBtn) {
    // Validate within the containing card
    const errorRoot = addBtn.closest(".card") || document;

    const addFirst = document.getElementById("addFirst");
    const addLast  = document.getElementById("addLast");
    const addPhone = document.getElementById("addPhone");
    const addEmail = document.getElementById("addEmail");
    const msgEl    = document.getElementById("colorAddResult");

    [addFirst, addLast, addPhone, addEmail].forEach(attachLiveClear);

    // Prevent double calls if inline onclick exists in HTML
    try { addBtn.removeAttribute("onclick"); } catch (_) {}

    addBtn.addEventListener("click", (e) => {
      e.preventDefault();
      clearErrors(errorRoot);

      let valid = true;

      if (!addFirst || addFirst.value.trim() === "") {
        showError(addFirst, "First name is required");
        valid = false;
      }
      if (!addLast || addLast.value.trim() === "") {
        showError(addLast, "Last name is required");
        valid = false;
      }

      const emailVal = (addEmail && addEmail.value ? addEmail.value.trim() : "");
      if (!addEmail || emailVal === "") {
        showError(addEmail, "Email is required");
        valid = false;
      } else if (!isEmail(emailVal)) {
        showError(addEmail, "Invalid email format");
        valid = false;
      }

      if (!valid) return;

      if (typeof window.addContact === "function") {
        window.addContact();
      } else {
        if (msgEl) msgEl.textContent = "Add Contact function is unavailable.";
        console.error("addContact is not defined");
      }
    });
  }
});


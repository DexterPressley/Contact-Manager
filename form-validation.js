document.addEventListener("DOMContentLoaded", () => {
  // ---------- Utils ----------
  function isEmail(str) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  }

  function clearErrors(form) {
    if (!form) return;
    form.querySelectorAll(".error").forEach((el) => (el.textContent = ""));
    form
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

      if (!valid) {
        e.preventDefault();
      } else {
        e.preventDefault(); // stop default submit
        doLogin();          // call existing login function
      }
    });
  }

  // ---------- SIGNUP (signup.html) ----------
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    const suFirst = document.getElementById("firstName");
    const suLast = document.getElementById("lastName");
    const suName = document.getElementById("signupUsername");
    const suEmail = document.getElementById("signupEmail"); // type="text" in HTML
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

      if (!valid) {
        e.preventDefault();
      } else {
        e.preventDefault(); // stop default submit
        doSignup();         // call existing signup function
      }
    });
  }
});


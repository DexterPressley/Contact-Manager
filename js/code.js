const urlBase = 'http://colorsdigitalocean.xyz/LAMPAPI/';
const extension = '.php';

let userId = 0;
let firstName = "";
let lastName = "";

// Simple email check for addContact()
function _isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(str || "").trim());
}

function doLogin()
{
  userId = 0;
  firstName = "";
  lastName = "";

  let login = document.getElementById("loginName").value;
  let password = document.getElementById("loginPassword").value;
  // var hash = md5( password );

  document.getElementById("loginResult").innerHTML = "";

  let tmp = { login: login, password: password };
  // var tmp = {login:login,password:hash};
  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + 'Login' + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let jsonObject = JSON.parse(xhr.responseText);
        userId = jsonObject.id;

        if (userId < 1) {
          document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
          return;
        }

        firstName = jsonObject.firstName;
        lastName = jsonObject.lastName;

        saveCookie();

        window.location.href = "color.html";
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("loginResult").innerHTML = err.message;
  }
}

function doSignup()
{
  // Grab fields (HTML IDs updated to match new signup.html)
  let firstName = document.getElementById("firstName").value;
  let lastName = document.getElementById("lastName").value;
  let login = document.getElementById("signupUsername").value;
  let password = document.getElementById("signupPassword").value;
  let confirmPassword = document.getElementById("signupConfirm").value;

  document.getElementById("signupResult").innerHTML = "";

  // Double-check
  if (password !== confirmPassword) {
    document.getElementById("signupResult").innerHTML = "Passwords do not match";
    return;
  }

  // Build payload that Register.php expects
  let tmp = { firstName: firstName, lastName: lastName, login: login, password: password };
  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + 'Register' + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function() {
      if (this.readyState === 4) {
        // Network OK?
        if (this.status !== 200) {
          document.getElementById("signupResult").innerHTML = "Signup failed (HTTP " + this.status + ")";
          return;
        }

        let jsonObject = {};
        try { jsonObject = JSON.parse(xhr.responseText); } catch (e) {}

        if (jsonObject.error && jsonObject.error !== "") {
          document.getElementById("signupResult").innerHTML = jsonObject.error;
          return;
        }

        // Success: since Register.php doesn't return id/first/last, just move to login
        document.getElementById("signupResult").innerHTML = "Account created successfully!";
        window.location.href = "index.html";
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("signupResult").innerHTML = err.message;
  }
}

function saveCookie()
{
  let minutes = 20;
  let date = new Date();
  date.setTime(date.getTime() + (minutes * 60 * 1000));
  document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
  userId = -1;
  let data = document.cookie;
  let splits = data.split(",");
  for (var i = 0; i < splits.length; i++) {
    let thisOne = splits[i].trim();
    let tokens = thisOne.split("=");
    if (tokens[0] == "firstName") {
      firstName = tokens[1];
    }
    else if (tokens[0] == "lastName") {
      lastName = tokens[1];
    }
    else if (tokens[0] == "userId") {
      userId = parseInt(tokens[1].trim());
    }
  }

  if (userId < 0) {
    window.location.href = "index.html";
  } else {
    // Optionally show name:
    // const u = document.getElementById("userName");
    // if (u) u.textContent = "Logged in as " + firstName + " " + lastName;
  }
}

function doLogout()
{
  userId = 0;
  firstName = "";
  lastName = "";
  document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
  window.location.href = "index.html";
}

/**
 * Add a contact (uses AddContacts.php).
 * Validates first/last required and email format on the client before sending.
 */
function addContact()
{
  const firstName = (document.getElementById("addFirst")?.value || "").trim();
  const lastName  = (document.getElementById("addLast")?.value || "").trim();
  const phone     = (document.getElementById("addPhone")?.value || "").trim();
  const email     = (document.getElementById("addEmail")?.value || "").trim();

  const msgEl = document.getElementById("colorAddResult");
  if (msgEl) msgEl.textContent = "";

  // Must be logged in
  if (!userId || userId < 1) {
    if (msgEl) msgEl.textContent = "Please log in.";
    return;
  }

  // Basic validation
  if (!firstName || !lastName) {
    if (msgEl) msgEl.textContent = "Must enter at least a first name and a last name";
    return;
  }
  if (!_isEmail(email)) {
    if (msgEl) msgEl.textContent = "Please enter a valid email address.";
    return;
  }

  const tmp = { firstName, lastName, phone, email, userId };
  const jsonPayload = JSON.stringify(tmp);
  const url = urlBase + 'AddContacts' + extension;

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try {
    xhr.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (this.status !== 200) {
          if (msgEl) msgEl.textContent = "Failed to add contact (HTTP " + this.status + ")";
          return;
        }

        let jsonObject = {};
        try { jsonObject = JSON.parse(xhr.responseText); }
        catch (e) {
          if (msgEl) msgEl.textContent = "Error parsing response";
          return;
        }

        if (jsonObject.error && jsonObject.error.length > 0) {
          if (msgEl) msgEl.textContent = jsonObject.error;
          return;
        }

        if (msgEl) msgEl.textContent = "Contact has been added!";

        // Clear inputs
        const f = document.getElementById("addFirst");
        const l = document.getElementById("addLast");
        const p = document.getElementById("addPhone");
        const e = document.getElementById("addEmail");
        if (f) f.value = "";
        if (l) l.value = "";
        if (p) p.value = "";
        if (e) e.value = "";
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    if (msgEl) msgEl.textContent = err.message;
  }
}

// ===== Debounced type-to-search =====
let _searchTimer = null;
let _inflightSearchXhr = null;

// Called on input change
function handleSearchInput() {
  if (_searchTimer) clearTimeout(_searchTimer);
  _searchTimer = setTimeout(() => {
    const q = document.getElementById("searchText").value.trim();
    if (q.length === 0) {
      setSearchMessage("");
      clearSearchResults();  // hides table + clears body
      return; // don't auto-load all contacts
    }
    searchContacts(q); // still call backend, filtering happens in renderSearchResults
  }, 250); // slight delay feels snappy
}

// Keep existing search contact button working
function searchColor() {
  const q = document.getElementById("searchText").value.trim();
  if (q.length === 0) {
    setSearchMessage("Type something to search.");
    clearSearchResults();
    return;
  }
  searchContacts(q);
}

function setSearchMessage(msg) {
  const el = document.getElementById("colorSearchResult");
  if (el) el.textContent = msg || "";
}

function clearSearchResults() {
  const body = document.getElementById("contactsBody");
  const p    = document.getElementById("colorList");
  const tbl  = document.getElementById("contactsTable");
  if (body) body.innerHTML = "";
  if (p) p.innerHTML = "";
  if (tbl) tbl.style.display = "none";
}

// Core search calling backend (SearchContacts.php)
function searchContacts(query) {
  if (!userId || userId < 1) {
    setSearchMessage("Please log in.");
    return;
  }

  setSearchMessage("Searching...");

  // Abort previous request to avoid races
  if (_inflightSearchXhr) {
    try { _inflightSearchXhr.abort(); } catch (_) {}
  }

  const payload = JSON.stringify({ search: query, userId: userId });
  const url = urlBase + 'SearchContacts' + extension; // matches PHP

  const xhr = new XMLHttpRequest();
  _inflightSearchXhr = xhr;
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;

    if (_inflightSearchXhr !== xhr) return; // ignore stale response
    _inflightSearchXhr = null;

    if (xhr.status !== 200) {
      setSearchMessage("Search failed (HTTP " + xhr.status + ")");
      clearSearchResults();
      return;
    }

    let out = {};
    try { out = JSON.parse(xhr.responseText); } catch (_) {}

    if (out.error && out.error.length) {
      setSearchMessage(out.error); // No Contacts Found
      clearSearchResults();
      return;
    }

    const entries = Array.isArray(out.entries) ? out.entries : [];
    renderSearchResults(entries);
    setSearchMessage(entries.length ? "Results found" : "No matching contacts");
  };

  xhr.send(payload);
}

// Render rows with Delete buttons
function renderSearchResults(entries) {
  const body = document.getElementById("contactsBody");
  const p    = document.getElementById("colorList");
  const tbl  = document.getElementById("contactsTable");

  if (body) body.innerHTML = "";
  if (p) p.innerHTML = "";

  // Filter: FirstName starts with the query (case-insensitive)
  const q = (document.getElementById("searchText").value || "").trim().toLowerCase();
  const filtered = entries.filter(e => (e.FirstName || "").toLowerCase().startsWith(q));

  // Toggle table visibility based on results
  if (!filtered.length) {
    if (tbl) tbl.style.display = "none";
    return;
  } else {
    if (tbl) tbl.style.display = "table";
  }

  filtered.forEach((item) => {
    const first = item.FirstName || "";
    const last  = item.LastName  || "";
    const phone = item.Phone     || "";
    const email = item.Email     || "";

    const tr = document.createElement("tr");
    tr.setAttribute("data-first", first);
    tr.setAttribute("data-last",  last);
    tr.innerHTML = `
      <td>${escapeHtml(first)}</td>
      <td>${escapeHtml(last)}</td>
      <td>${escapeHtml(phone)}</td>
      <td>${escapeHtml(email)}</td>
      <td><button class="buttons" onclick="deleteContact('${jsStr(first)}','${jsStr(last)}')">Delete</button></td>
    `;
    body.appendChild(tr);
  });
}

// Helpers
function escapeHtml(s){ return String(s ?? "").replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m])); }
function jsStr(s){ return String(s ?? "").replace(/['\\]/g, "\\$&"); }

function deleteContact(first, last) {
  // Make sure we have a logged-in userId
  if (!userId || userId < 1) {
    alert("You must be logged in.");
    return;
  }

  // Ask the user to confirm
  if (!confirm(`Delete contact: ${first} ${last}?`)) return;

  // Clear any old messages
  const msgEl = document.getElementById("contactDeleteResult") || document.getElementById("colorSearchResult");
  if (msgEl) msgEl.textContent = "";

  // Payload for PHP
  const tmp = { firstName: first, lastName: last, userId: userId };
  const jsonPayload = JSON.stringify(tmp);

  const url = urlBase + 'DeleteContacts' + extension;

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        let out = {};
        try { out = JSON.parse(xhr.responseText); } catch (e) {}

        if (this.status !== 200) {
          if (msgEl) msgEl.textContent = "Delete failed: HTTP " + this.status;
          return;
        }

        if (out.error && out.error.length) {
          if (msgEl) msgEl.textContent = "Delete failed: " + out.error;
          return;
        }

        // Success
        if (msgEl) msgEl.textContent = "Contact deleted";

        // Clear out the input fields
        const delFirst = document.getElementById("delFirst");
        const delLast = document.getElementById("delLast");
        if (delFirst) delFirst.value = "";
        if (delLast) delLast.value = "";

        const sel = `[data-first="${cssSel(first)}"][data-last="${cssSel(last)}"]`;
        const row = document.querySelector(sel);
        if (row && row.parentNode) row.parentNode.removeChild(row);
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    if (msgEl) msgEl.textContent = "Network error: " + err.message;
  }
}

// Helper to safely escape values in CSS selectors
function cssSel(s) {
  return String(s ?? "").replace(/["\\]/g, "\\$&");
}


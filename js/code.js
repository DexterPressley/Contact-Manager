const urlBase = 'http://colorsdigitalocean.xyz/LAMPAPI/';
const extension = '.php';

let userId = 0;
let firstName = "";
let lastName = "";

// Simple email check for add/edit
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
  // let tmp = {login:login,password:hash};
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
  let firstName = document.getElementById("firstName").value;
  let lastName = document.getElementById("lastName").value;
  let login = document.getElementById("signupUsername").value;
  let password = document.getElementById("signupPassword").value;
  let confirmPassword = document.getElementById("signupConfirm").value;

  document.getElementById("signupResult").innerHTML = "";

  if (password !== confirmPassword) {
    document.getElementById("signupResult").innerHTML = "Passwords do not match";
    return;
  }

  let tmp = { firstName, lastName, login, password };
  let jsonPayload = JSON.stringify(tmp);
  let url = urlBase + 'Register' + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function() {
      if (this.readyState === 4) {
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

  if (!userId || userId < 1) {
    if (msgEl) msgEl.textContent = "Please log in.";
    return;
  }

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
    let q = document.getElementById("searchText").value.trim();
    // blank or "*" => fetch ALL from backend
    if (q.length === 0) q = "*";
    searchContacts(q);
  }, 250);
}

// Button version
function searchColor() {
  let q = document.getElementById("searchText").value.trim();
  if (q.length === 0) q = "*";
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

  if (_inflightSearchXhr) {
    try { _inflightSearchXhr.abort(); } catch (_) {}
  }

  const payload = JSON.stringify({ search: query, userId: userId });
  const url = urlBase + 'SearchContacts' + extension;

  const xhr = new XMLHttpRequest();
  _inflightSearchXhr = xhr;
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;

    if (_inflightSearchXhr !== xhr) return;
    _inflightSearchXhr = null;

    if (xhr.status !== 200) {
      setSearchMessage("Search failed (HTTP " + xhr.status + ")");
      clearSearchResults();
      return;
    }

    let out = {};
    try { out = JSON.parse(xhr.responseText); } catch (_) {}

    if (out.error && out.error.length) {
      setSearchMessage(out.error); // e.g., "No Contacts Found"
      clearSearchResults();
      return;
    }

    const entries = Array.isArray(out.entries) ? out.entries : [];
    renderSearchResults(entries);
    setSearchMessage(entries.length ? "Results found" : "No matching contacts");
  };

  xhr.send(payload);
}

// Render rows with Edit + Delete buttons
function renderSearchResults(entries) {
  const body = document.getElementById("contactsBody");
  const p    = document.getElementById("colorList");
  const tbl  = document.getElementById("contactsTable");

  if (body) body.innerHTML = "";
  if (p) p.innerHTML = "";

  if (!entries.length) {
    if (tbl) tbl.style.display = "none";
    return;
  } else {
    if (tbl) tbl.style.display = "table";
  }

  entries.forEach((item) => {
    const id    = item.ID;
    const first = item.FirstName || "";
    theLast     = item.LastName  || "";
    const phone = item.Phone     || "";
    const email = item.Email     || "";

    const tr = document.createElement("tr");
    tr.setAttribute("data-id", id);
    tr.setAttribute("data-first", first);
    tr.setAttribute("data-last",  theLast);

    const cFirst = document.createElement("td");
    cFirst.textContent = first;

    const cLast = document.createElement("td");
    cLast.textContent = theLast;

    const cPhone = document.createElement("td");
    cPhone.textContent = phone;

    const cEmail = document.createElement("td");
    cEmail.textContent = email;

    const cActions = document.createElement("td");
    cActions.innerHTML = `
      <button class="btn" onclick="enterEditMode(this)">✏️ Edit</button>
      <button class="btn btn--danger" onclick="deleteContact('${jsStr(first)}','${jsStr(theLast)}')">🗑️ Delete</button>
    `;

    tr.appendChild(cFirst);
    tr.appendChild(cLast);
    tr.appendChild(cPhone);
    tr.appendChild(cEmail);
    tr.appendChild(cActions);
    body.appendChild(tr);
  });
}

// ----- Inline Edit Handlers -----
function enterEditMode(btn){
  const tr = btn.closest('tr');
  if (!tr) return;

  // if already editing, bail
  if (tr.dataset.editing === "1") return;
  tr.dataset.editing = "1";

  // stash originals
  tr.dataset.origFirst = tr.children[0].textContent.trim();
  tr.dataset.origLast  = tr.children[1].textContent.trim();
  tr.dataset.origPhone = tr.children[2].textContent.trim();
  tr.dataset.origEmail = tr.children[3].textContent.trim();

  // swap cells to inputs
  tr.children[0].innerHTML = `<input class="inline-input" type="text" value="${escapeHtml(tr.dataset.origFirst)}" />`;
  tr.children[1].innerHTML = `<input class="inline-input" type="text" value="${escapeHtml(tr.dataset.origLast)}" />`;
  tr.children[2].innerHTML = `<input class="inline-input" type="text" value="${escapeHtml(tr.dataset.origPhone)}" />`;
  tr.children[3].innerHTML = `<input class="inline-input" type="text" value="${escapeHtml(tr.dataset.origEmail)}" />`;

  // actions: Save/Cancel
  tr.children[4].innerHTML = `
    <button class="btn" onclick="saveEdit(this)">💾 Save</button>
    <button class="btn btn--danger" onclick="cancelEdit(this)">✖ Cancel</button>
  `;
}

function cancelEdit(btn){
  const tr = btn.closest('tr');
  if (!tr) return;

  tr.children[0].textContent = tr.dataset.origFirst || "";
  tr.children[1].textContent = tr.dataset.origLast  || "";
  tr.children[2].textContent = tr.dataset.origPhone || "";
  tr.children[3].textContent = tr.dataset.origEmail || "";

  tr.children[4].innerHTML = `
    <button class="btn" onclick="enterEditMode(this)">✏️ Edit</button>
    <button class="btn btn--danger" onclick="deleteContact('${jsStr(tr.dataset.origFirst || "")}','${jsStr(tr.dataset.origLast || "")}')">🗑️ Delete</button>
  `;

  tr.dataset.editing = "0";
}

function saveEdit(btn){
  const tr = btn.closest('tr');
  if (!tr) return;

  const id = parseInt(tr.getAttribute('data-id'), 10);
  if (!Number.isInteger(id)) {
    alert("Missing contact ID; cannot save.");
    return;
  }

  const inputs = tr.querySelectorAll('input.inline-input');
  const first = (inputs[0]?.value || "").trim();
  const last  = (inputs[1]?.value || "").trim();
  const phone = (inputs[2]?.value || "").trim();
  const email = (inputs[3]?.value || "").trim();

  // validate: require first/last; email if provided must be valid
  if (!first || !last) {
    alert("First and Last name are required.");
    return;
  }
  if (email && !_isEmail(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  const payload = JSON.stringify({
    firstName: first,
    lastName:  last,
    phone:     phone,
    email:     email,
    Id:        id
  });

  const url = urlBase + 'EditContacts' + extension;

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  xhr.onreadystatechange = function(){
    if (xhr.readyState !== 4) return;

    if (xhr.status !== 200) {
      alert("Save failed (HTTP " + xhr.status + ")");
      return;
    }

    let out = {};
    try { out = JSON.parse(xhr.responseText); } catch (_) {}

    if (out.error && out.error.length) {
      alert("Save failed: " + out.error);
      return;
    }

    // success: update row + actions back to Edit/Delete
    tr.children[0].textContent = first;
    tr.children[1].textContent = last;
    tr.children[2].textContent = phone;
    tr.children[3].textContent = email;

    tr.setAttribute('data-first', first);
    tr.setAttribute('data-last', last);

    tr.children[4].innerHTML = `
      <button class="btn" onclick="enterEditMode(this)">✏️ Edit</button>
      <button class="btn btn--danger" onclick="deleteContact('${jsStr(first)}','${jsStr(last)}')">🗑️ Delete</button>
    `;

    tr.dataset.editing = "0";
  };
  xhr.send(payload);
}

// Helpers
function escapeHtml(s){ return String(s ?? "").replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m])); }
function jsStr(s){ return String(s ?? "").replace(/['\\]/g, "\\$&"); }

function deleteContact(first, last) {
  // Must be logged in
  if (!userId || userId < 1) {
    alert("You must be logged in.");
    return;
  }

  // Normalize sources: args from inline OR the manual inputs
  const f = (first ?? document.getElementById("delFirst")?.value ?? "").trim();
  const l = (last  ?? document.getElementById("delLast")?.value  ?? "").trim();

  // Require both names before continuing
  if (!f || !l) {
    const msgEl = document.getElementById("contactDeleteResult") || document.getElementById("colorSearchResult");
    if (msgEl) msgEl.textContent = "Please enter both first and last name before deleting.";
    if (!f) document.getElementById("delFirst")?.focus();
    else if (!l) document.getElementById("delLast")?.focus();
    return;
  }

  if (!confirm(`Delete contact: ${f} ${l}?`)) return;

  const msgEl = document.getElementById("contactDeleteResult") || document.getElementById("colorSearchResult");
  if (msgEl) msgEl.textContent = "";

  const tmp = { firstName: f, lastName: l, userId: userId };
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

        if (msgEl) msgEl.textContent = "Contact deleted";

        // Clear manual delete inputs
        const delFirst = document.getElementById("delFirst");
        const delLast = document.getElementById("delLast");
        if (delFirst) delFirst.value = "";
        if (delLast) delLast.value = "";

        // Remove row from search results if present
        const sel = `[data-first="${cssSel(f)}"][data-last="${cssSel(l)}"]`;
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


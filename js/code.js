const urlBase = 'http://colorsdigitalocean.xyz/LAMPAPI/';
const extension = '.php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
//	var hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:password};
//	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + 'Login' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
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
	}
	catch(err)
	{
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
  let tmp = { firstName:firstName, lastName:lastName, login:login, password:password };
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
        // Redirect to login page
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
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
//		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
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

function addColor()
{
	let newColor = document.getElementById("colorText").value;
	document.getElementById("colorAddResult").innerHTML = "";

	let tmp = {color:newColor,userId,userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + 'AddColor' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("colorAddResult").innerHTML = "Color has been added";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("colorAddResult").innerHTML = err.message;
	}
	
}

function searchColor()
{
	let srch = document.getElementById("searchText").value;
	document.getElementById("colorSearchResult").innerHTML = "";
	
	let colorList = "";

	let tmp = {search:srch,userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + 'SearchColors' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("colorSearchResult").innerHTML = "Color(s) has been retrieved";
				let jsonObject = JSON.parse( xhr.responseText );
				
				for( let i=0; i<jsonObject.results.length; i++ )
				{
					colorList += jsonObject.results[i];
					if( i < jsonObject.results.length - 1 )
					{
						colorList += "<br />\r\n";
					}
				}
				
				document.getElementsByTagName("p")[0].innerHTML = colorList;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("colorSearchResult").innerHTML = err.message;
	}
	
}

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


# Grand Design Authentication UI

Files:
- `index.html` -> Registration
- `login.html` -> Login
- `dashboard.html` -> Demo protected route
- `style.css` -> Design system / responsive styling
- `auth.js` -> Validation, loading, success/error states and mock authentication

## Run

You can simply open `index.html` in a browser.

For a local server:
```bash
python -m http.server 5500
```

Then open:
http://localhost:5500/

## Mock backend

Registration and login use `localStorage` so the full flow can be tested without a backend.

Registered users are stored under:
`grand_design_users`

Current login session:
`grand_design_auth`

## Replace with real backend

Replace:
- `registerMock()`
- `loginMock()`

with `fetch()` calls to your API.

Example:
```js
const response = await fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
});

if (!response.ok) {
  throw new Error("SERVER_ERROR");
}

return await response.json();
```

For production authentication, prefer secure server-side sessions / HttpOnly cookies rather than storing passwords or authentication tokens in localStorage.

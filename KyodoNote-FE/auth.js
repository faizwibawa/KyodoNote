/*
 * Grand Design Authentication
 * ---------------------------------
 * This file uses localStorage as a mock backend.
 * Replace registerMock() and loginMock() with fetch()
 * when the real backend is ready.
 */

const STORAGE_KEY = "grand_design_users";
const AUTH_KEY = "grand_design_auth";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function setAuth(user) {
  // Demo only. In production, use a secure HttpOnly cookie/session
  // supplied by the backend rather than storing sensitive tokens here.
  localStorage.setItem(AUTH_KEY, JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    loggedInAt: new Date().toISOString()
  }));
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clearErrors(form) {
  form.querySelectorAll(".error").forEach(el => el.textContent = "");
  form.querySelectorAll("input").forEach(input => input.classList.remove("invalid"));
}

function showError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);

  if (input) input.classList.add("invalid");
  if (error) error.textContent = message;
}

function setMessage(element, message, type) {
  element.textContent = message;
  element.className = `form-message show ${type}-message`;
}

function clearMessage(element) {
  element.textContent = "";
  element.className = "form-message";
}

function setLoading(button, loading) {
  button.disabled = loading;
  button.classList.toggle("loading", loading);
}

/* -------------------------
   Mock backend
------------------------- */

async function registerMock(data) {
  await sleep(900);

  const users = getUsers();
  const exists = users.some(
    user => user.email.toLowerCase() === data.email.toLowerCase()
  );

  if (exists) {
    throw new Error("EMAIL_EXISTS");
  }

  const user = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name: data.name,
    email: data.email.toLowerCase(),
    password: data.password
  };

  users.push(user);
  saveUsers(users);

  return user;
}

async function loginMock(email, password) {
  await sleep(900);

  const users = getUsers();
  const user = users.find(
    item => item.email.toLowerCase() === email.toLowerCase()
  );

  if (!user || user.password !== password) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return user;
}

/* -------------------------
   Register
------------------------- */

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  const registerButton = document.getElementById("registerButton");
  const formMessage = document.getElementById("formMessage");

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors(registerForm);
    clearMessage(formMessage);

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    let valid = true;

    if (name.length < 2) {
      showError("name", "nameError", "Name must contain at least 2 characters.");
      valid = false;
    }

    if (!validateEmail(email)) {
      showError("email", "emailError", "Please enter a valid email.");
      valid = false;
    }

    if (password.length < 8) {
      showError("password", "passwordError", "Password must be at least 8 characters.");
      valid = false;
    }

    if (confirmPassword !== password) {
      showError(
        "confirmPassword",
        "confirmPasswordError",
        "Passwords do not match."
      );
      valid = false;
    }

    if (!valid) {
      setMessage(formMessage, "Please fix the validation errors above.", "error");
      return;
    }

    setLoading(registerButton, true);

    try {
      const user = await registerMock({ name, email, password });

      setAuth(user);
      setMessage(
        formMessage,
        "Registration successful! Redirecting to login...",
        "success"
      );

      registerForm.reset();

      setTimeout(() => {
        window.location.href = "login.html?registered=1";
      }, 800);

    } catch (error) {
      if (error.message === "EMAIL_EXISTS") {
        showError("email", "emailError", "This email is already registered.");
        setMessage(formMessage, "Registration failed. Email already exists.", "error");
      } else {
        setMessage(formMessage, "Server error. Please try again.", "error");
      }
    } finally {
      setLoading(registerButton, false);
    }
  });
}

/* -------------------------
   Login
------------------------- */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  const loginButton = document.getElementById("loginButton");
  const loginMessage = document.getElementById("loginMessage");

  const params = new URLSearchParams(window.location.search);
  if (params.get("registered") === "1") {
    setMessage(loginMessage, "Registration successful. Please login.", "success");
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors(loginForm);
    clearMessage(loginMessage);

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    let valid = true;

    if (!validateEmail(email)) {
      showError("loginEmail", "loginEmailError", "Please enter a valid email.");
      valid = false;
    }

    if (!password) {
      showError("loginPassword", "loginPasswordError", "Password is required.");
      valid = false;
    }

    if (!valid) {
      setMessage(loginMessage, "Please fix the validation errors above.", "error");
      return;
    }

    setLoading(loginButton, true);

    try {
      const user = await loginMock(email, password);
      setAuth(user);

      setMessage(loginMessage, "Login successful! Redirecting...", "success");

      // Change this to your real dashboard route.
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 800);

    } catch (error) {
      if (error.message === "INVALID_CREDENTIALS") {
        setMessage(loginMessage, "Email or password is incorrect.", "error");
      } else {
        setMessage(loginMessage, "Server error. Please try again.", "error");
      }
    } finally {
      setLoading(loginButton, false);
    }
  });
}

/* -------------------------
   Password visibility
------------------------- */

document.querySelectorAll(".toggle-password").forEach(button => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.target);
    const visible = input.type === "text";

    input.type = visible ? "password" : "text";
    button.textContent = visible ? "Show" : "Hide";
    button.setAttribute(
      "aria-label",
      visible ? "Show password" : "Hide password"
    );
  });
});

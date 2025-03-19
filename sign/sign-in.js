document.addEventListener("DOMContentLoaded", function () {
  validateForm();
});

document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const helperText = document.querySelector(".helper-text");

    if (!isValidEmailFormat(email)) {
      helperText.textContent =
        "* 올바른 이메일 주소를 입력해주세요. (예: example@example.com)";
      helperText.style.display = "block";
      return;
    }

    const validateString = validatePassword(password);
    if (validateString !== "") {
      helperText.textContent = validateString;
      helperText.style.display = "block";
      return;
    }

    await requestSignin({ email, password });

    window.location.href = "../board/main/main.html";
  });

async function requestSignin(signinInfo) {
  try {
    const response = await fetch("http://localhost:8080/auth/tokens", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signinInfo),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    sessionStorage.setItem("accessToken", result.data.accessToken);
    return result;
  } catch (error) {
    alert("Signup failed:");
    throw error;
  }
}

function validateForm() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const loginButton = document.querySelector("button[type='submit']");

  if (email && password) {
    loginButton.disabled = false;
    loginButton.style.backgroundColor = "#7f6aee";
    loginButton.style.cursor = "pointer";
  } else {
    loginButton.disabled = true;
    loginButton.style.backgroundColor = "#aca0eb";
    loginButton.style.cursor = "not-allowed";
  }
}

document.getElementById("email").addEventListener("input", function () {
  document.querySelector(".helper-text").style.display = "none";
  validateForm();
});

document.getElementById("password").addEventListener("input", function () {
  document.querySelector(".helper-text").style.display = "none";
  validateForm();
});

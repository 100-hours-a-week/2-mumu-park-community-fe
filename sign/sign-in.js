// 페이지 로드 시 초기 설정
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

    const isExistUser = await checkExistUser(email, password);
    if (!isExistUser) {
      helperText.textContent = "* 아이디 또는 비밀번호를 확인해주세요.";
      helperText.style.display = "block";
      return;
    }

    const currentUser = {
      email: email,
      profileImage: getUserProfileImage(email),
    };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    window.location.href = "../board/main/main.html";
  });

async function checkExistUser(email, password) {
  try {
    const response = await fetch("../data/member.json");

    if (!response.ok) {
      throw new Error("error creating");
    }

    const users = await response.json();
    return users.some(
      (user) => user.email === email && user.password === password
    );
  } catch (err) {
    console.error("데이터를 가져오는 중 오류 발생:", err);
    return false;
  }
}

function getUserProfileImage(email) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find((user) => user.email === email);
  return user.profileImage || "../photo/default_profile.jpeg"; // 기본 이미지 경로 지정
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

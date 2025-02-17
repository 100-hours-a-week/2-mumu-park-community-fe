// 이메일 유효성 검사
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
  return emailRegex.test(email);
}

// 비밀번호 빈값 체크
function checkEmptyPassword(password) {
  if (password.length === 0) {
    return true;
  }
}

// 비밀번호 형식 검사
function checkPasswordFormat(password) {
  // 비밀번호 조건: 8자 이상, 20자 이하
  if (password.length < 8 || password.length > 20) return false;

  // 영문자, 숫자, 특수문자 포함 여부 확인
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // 필수 문자 종류 중 하나 이상 포함
  return hasLetter || hasNumber || hasSpecial;
}

// 사용자 존재 여부 확인
function checkExistUser(email, password) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  return users.some(
    (user) => user.email === email && user.password === password
  );
}

// 사용자의 프로필 이미지 가져오기
function getUserProfileImage(email) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find((user) => user.email === email);
  return user.profileImage || "../photo/default_profile.jpeg"; // 기본 이미지 경로 지정
}

// 폼 유효성 검사 및 버튼 상태 업데이트
function validateForm() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const loginButton = document.querySelector("button[type='submit']");

  // 이메일과 비밀번호가 모두 입력된 경우
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

// 페이지 로드 시 초기 설정
document.addEventListener("DOMContentLoaded", function () {
  validateForm();
});

// 로그인 폼 제출 처리
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const helperText = document.querySelector(".helper-text");

  // 이메일 검증
  if (!validateEmail(email)) {
    helperText.textContent =
      "* 올바른 이메일 주소를 입력해주세요. (예: example@example.com)";
    helperText.style.display = "block";
    return;
  }

  // 비밀번호 빈값 검증
  if (checkEmptyPassword(password)) {
    helperText.textContent = "* 비밀번호를 입력해주세요.";
    helperText.style.display = "block";
    return;
  }

  // 비밀번호 형식 검증
  if (!checkPasswordFormat(password)) {
    helperText.textContent =
      "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
    helperText.style.display = "block";
    return;
  }

  // 사용자 존재 여부 검증
  if (!checkExistUser(email, password)) {
    helperText.textContent = "* 아이디 또는 비밀번호를 확인해주세요.";
    helperText.style.display = "block";
    return;
  }

  // 로그인 성공 시 사용자 정보 저장
  const currentUser = {
    email: email,
    profileImage: getUserProfileImage(email),
  };
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  // 메인 페이지로 이동
  window.location.href = "../board/main/main.html";
});

// 입력 필드 이벤트 리스너
document.getElementById("email").addEventListener("input", function () {
  document.querySelector(".helper-text").style.display = "none";
  validateForm();
});

document.getElementById("password").addEventListener("input", function () {
  document.querySelector(".helper-text").style.display = "none";
  validateForm();
});

document.addEventListener("DOMContentLoaded", function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    window.location.href = "../sign/sign-in.html";
    return;
  }

  // 프로필 이미지 업데이트
  const profileImage = document.querySelector(".profile-image img");
  if (profileImage) {
    profileImage.src = currentUser.profileImage || "../photo/profile_mumu.jpeg";
    profileImage.alt = `${currentUser.email}'s profile`;
  }

  const profileSection = document.querySelector(".profile-section");
  const profileDropdown = document.querySelector(".profile-dropdown");

  // 프로필 아이콘 클릭 시 드롭다운 토글
  profileSection.addEventListener("click", function (event) {
    event.stopPropagation(); // 이벤트 버블링 방지
    profileDropdown.style.display =
      profileDropdown.style.display === "none" ||
      profileDropdown.style.display === ""
        ? "block"
        : "none";
  });

  // 문서 다른 곳 클릭 시 드롭다운 닫기
  document.addEventListener("click", function () {
    profileDropdown.style.display = "none";
  });

  // 드롭다운 메뉴 이벤트 리스너
  const dropdownItems = document.querySelectorAll(".dropdown-item");
  dropdownItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.stopPropagation(); // 이벤트 버블링 방지
      const text = e.target.textContent;
      switch (text) {
        case "회원정보수정":
          window.location.href = "../profile/edit-profile.html";
          break;
        case "비밀번호수정":
          window.location.href = "../profile/password-update.html";
          break;
        case "로그아웃":
          localStorage.removeItem("currentUser");
          window.location.href = "../sign/sign-in.html";
          break;
      }
    });
  });

  setupPasswordUpdate();
});

function setupPasswordUpdate() {
  const passwordForm = document.getElementById("newPasswordForm");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const submitButton = document.querySelector('button[type="submit"]');
  const passwordHelperText = passwordInput
    .closest(".input-group")
    .querySelector(".helper-text");
  const confirmPasswordHelperText = confirmPasswordInput
    .closest(".input-group")
    .querySelector(".helper-text");

  // 버튼 상태 업데이트 함수
  function updateSubmitButton() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const passwordError = validatePassword(password, confirmPassword);
    const confirmPasswordError = validatePasswordConfirm(
      password,
      confirmPassword
    );

    if (
      !passwordError &&
      !confirmPasswordError &&
      password &&
      confirmPassword
    ) {
      submitButton.disabled = false;
      submitButton.style.backgroundColor = "#7f6aee";
      submitButton.style.cursor = "pointer";
    } else {
      submitButton.disabled = true;
      submitButton.style.backgroundColor = "#aca0eb";
      submitButton.style.cursor = "not-allowed";
    }
  }

  // 비밀번호 입력 시 검증
  passwordInput.addEventListener("input", function () {
    const password = this.value;
    const confirmPassword = confirmPasswordInput.value;
    const errorMessage = validatePassword(password, confirmPassword);

    // 오류가 있을 때만 헬퍼 텍스트 표시
    if (errorMessage) {
      passwordHelperText.textContent = errorMessage;
      passwordHelperText.style.display = "block";
    } else {
      passwordHelperText.textContent = "";
      passwordHelperText.style.display = "none";
    }

    // 버튼 상태 업데이트
    updateSubmitButton();
  });

  // 비밀번호 확인 입력 시 검증
  confirmPasswordInput.addEventListener("input", function () {
    const password = passwordInput.value;
    const confirmPassword = this.value;
    const errorMessage = validatePasswordConfirm(password, confirmPassword);

    // 오류가 있을 때만 헬퍼 텍스트 표시
    if (errorMessage) {
      confirmPasswordHelperText.textContent = errorMessage;
      confirmPasswordHelperText.style.display = "block";
    } else {
      confirmPasswordHelperText.textContent = "";
      confirmPasswordHelperText.style.display = "none";
    }

    // 버튼 상태 업데이트
    updateSubmitButton();
  });

  // 초기 버튼 상태 설정
  updateSubmitButton();

  // 폼 제출 이벤트
  passwordForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // 비밀번호 최종 검증
    const passwordErrorMessage = validatePassword(password, confirmPassword);
    const confirmPasswordErrorMessage = validatePasswordConfirm(
      password,
      confirmPassword
    );

    // 에러 메시지가 있으면 표시
    if (passwordErrorMessage) {
      passwordHelperText.textContent = passwordErrorMessage;
      passwordHelperText.style.display = "block";
    }

    if (confirmPasswordErrorMessage) {
      confirmPasswordHelperText.textContent = confirmPasswordErrorMessage;
      confirmPasswordHelperText.style.display = "block";
    }

    // 모든 검증 통과 시 비밀번호 변경
    if (!passwordErrorMessage && !confirmPasswordErrorMessage) {
      changePassword(password);
    }
  });

  // 비밀번호 검증 함수
  function validatePassword(password, confirmPassword) {
    if (!password) {
      return "* 비밀번호를 입력해 주세요.";
    }

    if (password.length < 8 || password.length > 20) {
      return "* 비밀번호는 8자 이상, 20자 이하여야 합니다.";
    }

    if (!isValidPasswordFormat(password)) {
      return "* 비밀번호는 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
    }

    return "";
  }

  // 비밀번호 확인 검증 함수
  function validatePasswordConfirm(password, confirmPassword) {
    if (!confirmPassword) {
      return "* 비밀번호 확인을 한번 더 입력해주세요.";
    }

    if (password !== confirmPassword) {
      return "* 비밀번호와 다릅니다.";
    }

    return "";
  }

  // 비밀번호 형식 검증 함수
  function isValidPasswordFormat(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
  }

  // 비밀번호 변경 함수
  function changePassword(newPassword) {
    // 현재 로그인된 사용자 정보 가져오기
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    // 사용자 데이터 업데이트
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex((u) => u.email === currentUser.email);

    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      localStorage.setItem("users", JSON.stringify(users));

      // 현재 로그인 사용자 정보도 업데이트
      currentUser.password = newPassword;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      // 입력 필드 초기화
      passwordInput.value = "";
      confirmPasswordInput.value = "";

      // 토스트 메시지 표시
      showToast("수정이 완료되었습니다.");
      setTimeout(() => {
        window.location.href = "../board/main/main.html";
      }, 3000);
    } else {
      alert("사용자 정보를 찾을 수 없습니다.");
    }
  }
}

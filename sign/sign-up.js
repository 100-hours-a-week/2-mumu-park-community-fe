// 이메일 유효성 검사 함수
function validateEmail(email) {
  if (!email) {
    return "* 이메일을 입력해주세요.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
  if (!emailRegex.test(email)) {
    return "* 올바른 이메일 주소를 입력해주세요. (예: example@example.com)";
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.some((user) => user.email === email)) {
    return "* 중복된 이메일입니다.";
  }

  return "";
}

// 비밀번호 유효성 검사 함수
function validatePassword(password) {
  if (!password) {
    return "* 비밀번호를 입력해주세요.";
  }

  if (password.length < 8 || password.length > 20) {
    return "* 비밀번호는 8자 이상, 20자 이하여야 합니다.";
  }

  if (!isValidPasswordLength(password) || !isValidPasswordFormat(password)) {
    return "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
  }

  return "";
}

function isValidPasswordLength(password) {
  if (password.length < 8 || password.length > 20) {
    return false;
  }
  return true;
}

function isValidPasswordFormat(password) {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
}

// 비밀번호 확인 검사 함수
function validatePasswordConfirm(password, confirmPassword) {
  if (!confirmPassword) {
    return "* 비밀번호를 한번더 입력해주세요.";
  }

  if (password !== confirmPassword) {
    return "* 비밀번호가 다릅니다.";
  }

  return "";
}

// 닉네임 유효성 검사 함수
function validateNickname(nickname) {
  if (!nickname) {
    return "* 닉네임을 입력해주세요.";
  }

  if (nickname.includes(" ")) {
    return "* 띄어쓰기를 없애주세요.";
  }

  if (nickname.length > 10) {
    return "* 닉네임은 최대 10자까지 작성 가능합니다.";
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.some((user) => user.nickname === nickname)) {
    return "* 중복된 닉네임입니다.";
  }

  return "";
}

// 이미지 검증 함수
function validateProfileImage() {
  const profileImage = document.getElementById("profile-imag").files[0];
  if (!profileImage) {
    return "* 프로필 사진을 추가해주세요.";
  }
  return "";
}

// 전체 폼 유효성 검사 함수
function validateForm() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const nickname = document.getElementById("nickname").value;
  const profileImage = document.getElementById("profile-imag").files[0];
  const submitButton = document.querySelector("button[type='submit']");

  // 모든 필드의 유효성 검사
  const isEmailValid = validateEmail(email) === "";
  const isPasswordValid = validatePassword(password) === "";
  const isConfirmValid =
    validatePasswordConfirm(password, confirmPassword) === "";
  const isNicknameValid = validateNickname(nickname) === "";
  const isProfileImageValid = !!profileImage;

  // 모든 조건이 충족되면 버튼 활성화
  if (
    isEmailValid &&
    isPasswordValid &&
    isConfirmValid &&
    isNicknameValid &&
    isProfileImageValid
  ) {
    submitButton.disabled = false;
    submitButton.style.backgroundColor = "#7f6aee";
    submitButton.style.cursor = "pointer";
  } else {
    submitButton.disabled = true;
    submitButton.style.backgroundColor = "#aca0eb";
    submitButton.style.cursor = "not-allowed";
  }

  return (
    isEmailValid &&
    isPasswordValid &&
    isConfirmValid &&
    isNicknameValid &&
    isProfileImageValid
  );
}

// 이미지 압축 함수
async function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // 최대 크기 지정 (예: 300px)
        const MAX_SIZE = 300;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // 이미지 품질 조정 (0.6 = 60% 품질)
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.6);
        resolve(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// 이미지 프리뷰 클릭 처리
document.getElementById("imagePreview").addEventListener("click", function () {
  document.getElementById("profile-imag").click();
});

// 이미지 미리보기 처리
document
  .getElementById("profile-imag")
  .addEventListener("change", function (e) {
    const file = e.target.files[0];
    const imagePreview = document.getElementById("imagePreview");
    const previewImg = document.getElementById("previewImg");
    const altText = document.querySelector(".alt-text");
    const helperText =
      this.closest(".input-group").querySelector(".helper-text");

    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        previewImg.style.display = "block";
        previewImg.src = e.target.result;
        altText.style.display = "none";
        imagePreview.style.backgroundColor = "transparent";
        helperText.style.display = "none";
      };
      reader.readAsDataURL(file);
    } else {
      // 파일 선택이 취소된 경우
      previewImg.style.display = "none";
      previewImg.src = "";
      altText.style.display = "block";
      imagePreview.style.backgroundColor = "#ccc";
      helperText.textContent = "* 프로필 사진을 추가해주세요.";
      helperText.style.display = "block";
    }
    validateForm();
  });

// blur 이벤트 리스너 설정
const fields = ["email", "password", "confirm-password", "nickname"];
fields.forEach((field) => {
  const input = document.getElementById(field);
  const helperText = input.nextElementSibling;

  input.addEventListener("blur", function () {
    let validationResult = "";

    switch (field) {
      case "email":
        validationResult = validateEmail(this.value);
        break;
      case "password":
        validationResult = validatePassword(this.value);
        const confirmInput = document.getElementById("confirm-password");
        if (confirmInput.value) {
          const confirmHelper = confirmInput.nextElementSibling;
          const confirmResult = validatePasswordConfirm(
            this.value,
            confirmInput.value
          );
          confirmHelper.textContent = confirmResult;
          confirmHelper.style.display = confirmResult ? "block" : "none";
        }
        break;
      case "confirm-password":
        const passwordInput = document.getElementById("password");
        validationResult = validatePasswordConfirm(
          passwordInput.value,
          this.value
        );
        break;
      case "nickname":
        validationResult = validateNickname(this.value);
        break;
    }

    helperText.textContent = validationResult;
    helperText.style.display = validationResult ? "block" : "none";
    validateForm();
  });

  // input 이벤트도 추가하여 실시간으로 버튼 상태 업데이트
  input.addEventListener("input", function () {
    helperText.style.display = "none";
    validateForm();
  });
});

// 페이지 로드 시 초기 유효성 검사
document.addEventListener("DOMContentLoaded", function () {
  validateForm();
});

// 폼 제출 처리
document
  .getElementById("signupForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const nickname = document.getElementById("nickname").value;
    const profileImage = document.getElementById("profile-imag").files[0];

    // 모든 필드 유효성 검사
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const confirmValidation = validatePasswordConfirm(
      password,
      confirmPassword
    );
    const nicknameValidation = validateNickname(nickname);
    const profileImageValidation = validateProfileImage();

    // 에러 메시지 표시
    document.querySelector("#email + .helper-text").textContent =
      emailValidation;
    document.querySelector("#password + .helper-text").textContent =
      passwordValidation;
    document.querySelector("#confirm-password + .helper-text").textContent =
      confirmValidation;
    document.querySelector("#nickname + .helper-text").textContent =
      nicknameValidation;

    const profileImageHelper = document
      .querySelector("#profile-imag")
      .closest(".input-group")
      .querySelector(".helper-text");
    profileImageHelper.textContent = profileImageValidation;

    // 유효성 검사 실패 시 제출 중단
    if (
      emailValidation ||
      passwordValidation ||
      confirmValidation ||
      nicknameValidation ||
      profileImageValidation
    ) {
      [
        emailValidation,
        passwordValidation,
        confirmValidation,
        nicknameValidation,
      ].forEach((validation, index) => {
        if (validation) {
          document.querySelectorAll(".helper-text")[index].style.display =
            "block";
        }
      });
      if (profileImageValidation) {
        profileImageHelper.style.display = "block";
      }
      return;
    }

    try {
      // 이미지 압축
      const compressedImage = await compressImage(profileImage);

      // 사용자 데이터 구조
      const newUser = {
        id: Date.now().toString(), // 고유 ID 생성
        email,
        password,
        nickname,
        profileImage: compressedImage,
        createdAt: new Date().toISOString(),
      };

      // 기존 사용자 데이터 가져오기
      const users = JSON.parse(localStorage.getItem("users")) || [];
      users.push(newUser);

      // 저장
      localStorage.setItem("users", JSON.stringify(users));

      // 로그인 페이지로 이동
      window.location.href = "sign-in.html?status=ACAOEB";
    } catch (error) {
      console.error("회원가입 처리 중 오류 발생:", error);
      alert("회원가입 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  });

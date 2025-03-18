async function validateForm() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const nickname = document.getElementById("nickname").value;
  const profileImage = document.getElementById("profile-imag").files[0];
  const submitButton = document.querySelector("button[type='submit']");

  const isEmailValid = (await validateEmail(email)) === "";
  const isPasswordValid = validatePassword(password) === "";
  const isConfirmValid =
    validatePasswordConfirm(password, confirmPassword) === "";
  const isNicknameValid = (await validateNickname(nickname)) === "";
  const isProfileImageValid = !!profileImage;

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

document.getElementById("imagePreview").addEventListener("click", function () {
  document.getElementById("profile-imag").click();
});

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
      previewImg.style.display = "none";
      previewImg.src = "";
      altText.style.display = "block";
      imagePreview.style.backgroundColor = "#ccc";
      helperText.textContent = "* 프로필 사진을 추가해주세요.";
      helperText.style.display = "block";
    }
    validateForm();
  });

const fields = ["email", "password", "confirm-password", "nickname"];
fields.forEach((field) => {
  const input = document.getElementById(field);
  const helperText = input.nextElementSibling;

  input.addEventListener("blur", async function () {
    let validationResult = "";

    switch (field) {
      case "email":
        validationResult = await validateEmail(this.value);
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
        validationResult = await validateNickname(this.value);
        break;
    }

    helperText.textContent = validationResult;
    helperText.style.display = validationResult ? "block" : "none";
    validateForm();
  });

  input.addEventListener("input", function () {
    helperText.style.display = "none";
    validateForm();
  });
});

document.addEventListener("DOMContentLoaded", function () {
  validateForm();
});

document
  .getElementById("signupForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const nickname = document.getElementById("nickname").value;
    const profileImage = document.getElementById("profile-imag").files[0];

    // Todo : 추후 checkEmailDuplicate 메서드 사용하도록 변경
    const emailValidation = await validateEmail(email);
    const passwordValidation = validatePassword(password);
    const confirmValidation = validatePasswordConfirm(
      password,
      confirmPassword
    );
    // Todo : 추후 checkNicknameDuplicate 메서드를 사용하도록 변경
    const nicknameValidation = await validateNickname(nickname);
    const profileImageValidation = validateProfileImage();

    if (
      emailValidation ||
      passwordValidation ||
      confirmValidation ||
      nicknameValidation ||
      profileImageValidation
    ) {
      return;
    }

    try {
      const compressedImage = await compressImage(profileImage);

      const newUser = {
        email,
        password,
        nickname,
        profileImage: "https://test.s3.img.jpeg",
      };

      await signupUser(newUser);

      console.log("회원가입 완료, 로그인 페이지 이동");
      window.location.href = "sign-in.html?status=ACAOEB";
    } catch (error) {
      console.error("회원가입 처리 중 오류 발생:", error);
      alert("회원가입 처리 중 오류 발생:", error);
    }
  });

async function signupUser(userData) {
  try {
    const response = await fetch("http://localhost:8080/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Signup failed:", error);
    alert("Signup failed:");
    throw error;
  }
}

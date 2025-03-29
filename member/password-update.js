document.addEventListener("DOMContentLoaded", async function () {
  const profileImage = document.querySelector(".profile-image img");
  const userInfo = await getUserInfo();

  if (profileImage) {
    profileImage.src = userInfo.profileImg;
    profileImage.alt = `profileImg`;
  }

  dropdownSetting();
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

  passwordInput.addEventListener("input", function () {
    const password = this.value;
    const confirmPassword = confirmPasswordInput.value;
    const errorMessage = validatePassword(password, confirmPassword);

    if (errorMessage) {
      passwordHelperText.textContent = errorMessage;
      passwordHelperText.style.display = "block";
    } else {
      passwordHelperText.textContent = "";
      passwordHelperText.style.display = "none";
    }

    updateSubmitButton();
  });

  confirmPasswordInput.addEventListener("input", function () {
    const password = passwordInput.value;
    const confirmPassword = this.value;
    const errorMessage = validatePasswordConfirm(password, confirmPassword);

    if (errorMessage) {
      confirmPasswordHelperText.textContent = errorMessage;
      confirmPasswordHelperText.style.display = "block";
    } else {
      confirmPasswordHelperText.textContent = "";
      confirmPasswordHelperText.style.display = "none";
    }

    updateSubmitButton();
  });

  updateSubmitButton();

  passwordForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    const passwordErrorMessage = validatePassword(password);
    const confirmPasswordErrorMessage = validatePasswordConfirm(
      password,
      confirmPassword
    );

    if (passwordErrorMessage) {
      passwordHelperText.textContent = passwordErrorMessage;
      passwordHelperText.style.display = "block";
    }

    if (confirmPasswordErrorMessage) {
      confirmPasswordHelperText.textContent = confirmPasswordErrorMessage;
      confirmPasswordHelperText.style.display = "block";
    }

    if (!passwordErrorMessage && !confirmPasswordErrorMessage) {
      changePassword(password);
    }
  });
}

async function changePassword(newPassword) {
  try {
    const token = sessionStorage.getItem("accessToken");

    const response = await fetch(`http://localhost:8080/users/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        newPassword: newPassword,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    showToast("비밀번호 수정이 완료되었습니다.");
    setTimeout(() => {
      window.location.href = "../board/main/main.html";
    }, 2000);
  } catch (error) {
    console.error("Password Change Failed:", error);
    alert("Password Change Failed:");
    throw error;
  }
}

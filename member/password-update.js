document.addEventListener("DOMContentLoaded", function () {
  const profileImage = document.querySelector(".profile-image img");
  if (profileImage) {
    profileImage.src = "../../photo/profile_mumu.jpeg";
    profileImage.alt = `profileImg`;
  }

  const profileSection = document.querySelector(".profile-section");
  const profileDropdown = document.querySelector(".profile-dropdown");

  profileSection.addEventListener("click", function (event) {
    event.stopPropagation();
    profileDropdown.style.display =
      profileDropdown.style.display === "none" ||
      profileDropdown.style.display === ""
        ? "block"
        : "none";
  });

  document.addEventListener("click", function () {
    profileDropdown.style.display = "none";
  });

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

async function changePassword(userId, prevPassword, newPassword) {
  try {
    const response = await fetch(`/users/${userId}/password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prevPassword: prevPassword,
        newPassword: newPassword,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Password Change Failed:", error);
    throw error;
  }
}

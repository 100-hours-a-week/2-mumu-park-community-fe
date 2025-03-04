document.addEventListener("DOMContentLoaded", async function () {
  const profileImage = document.querySelector(".profile-image img");
  if (profileImage) {
    profileImage.src = "../../photo/profile_mumu.jpeg";
    profileImage.alt = `profileImg`;
  }

  const userProfile = await fetchUserProfile();

  const emailElement = document.querySelector(".input-group p");
  emailElement.textContent = userProfile.email;

  const nicknameInput = document.getElementById("nickname");
  nicknameInput.value = userProfile.nickname;

  // 프로필 드롭다운 설정
  dropdownSetting();
  // 프로필 이미지 업데이트 설정
  setupProfileImageUpdate();
  // 폼 제출 이벤트 설정
  setupFormSubmission();
  // 회원탈퇴 버튼 설정
  setupWithdrawal();
});

async function fetchUserProfile() {
  try {
    // Todo : 추후 서버 api url 변경해야함
    const response = await fetch("../data/member.json");

    if (!response.ok) {
      throw new Error("error creating");
    }

    const data = await response.json();
    return data[1];
  } catch (error) {
    console.error("Error fetching user profile:", error);
    alert("Error fetching user profile");
    return [];
  }
}

function setupProfileImageUpdate() {
  const imagePreview = document.getElementById("imagePreview");
  const fileInput = document.getElementById("profile-image");
  const previewImg = document.getElementById("previewImg");
  const profileImage = document.querySelector(".profile-image img");

  if (previewImg) {
    profileImage.src = "../photo/profile_mumu.jpeg";
    profileImage.alt = `profileImg`;
  }

  imagePreview.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async function (e) {
    const file = e.target.files[0];
    const altText = document.querySelector(".alt-text");
    const helperText =
      this.closest(".input-group").querySelector(".helper-text");

    if (file) {
      try {
        const compressedImage = await compressImage(file);
        previewImg.style.display = "block";
        previewImg.src = compressedImage;
        if (altText) altText.style.display = "none";
        imagePreview.style.backgroundColor = "transparent";
        if (helperText) helperText.style.display = "none";
      } catch (error) {
        console.error("이미지 압축 중 오류 발생:", error);
      }
    } else {
      previewImg.style.display = "none";
      previewImg.src = "";
      if (altText) altText.style.display = "block";
      imagePreview.style.backgroundColor = "#ccc";
      if (helperText) {
        helperText.textContent = "* 프로필 사진을 추가해주세요.";
        helperText.style.display = "block";
      }
    }
    validateForm();
  });
}

function validateForm() {
  const nicknameInput = document.getElementById("nickname");
  const submitButton = document.querySelector(".update-btn");

  const { nickname } = getCurrentUser();
  const isNicknameChanged = nickname !== nicknameInput.value;

  const isNicknameValid = validateNickname(nicknameInput.value);
  if (isNicknameChanged && isNicknameValid) {
    submitButton.disabled = false;
    submitButton.style.backgroundColor = "#7f6aee";
    submitButton.style.cursor = "pointer";
  } else {
    submitButton.disabled = true;
    submitButton.style.backgroundColor = "#aca0eb";
    submitButton.style.cursor = "not-allowed";
  }

  return isNicknameChanged && isNicknameValid;
}

function setupFormSubmission() {
  const form = document.getElementById("signupForm");
  const nicknameInput = document.getElementById("nickname");

  validateForm();

  nicknameInput.addEventListener("input", function () {
    validateNickname(this.value);
    validateForm();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nickname = nicknameInput.value;
    if (validateForm()) {
      updateProfile({
        nickname: nickname,
        profileImage: document.getElementById("previewImg").src,
      });
    }
  });
}

async function updateProfile(updateData) {
  const { userId } = getCurrentUser();

  try {
    const response = await fetch(`/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error("프로필 수정 실패");
    }

    showToast("수정이 완료되었습니다.");
    setTimeout(() => {
      window.location.href = "../board/main/main.html";
    }, 3000);
  } catch (error) {
    console.error("프로필 수정 중 오류 발생:", error);
    alert("프로필 수정에 실패했습니다.");
  }
}

function showWithdrawlConfirmDialog(callback) {
  const overlay = document.createElement("div");
  overlay.className = "dialog-overlay";

  const dialog = document.createElement("div");
  dialog.className = "confirm-dialog";
  dialog.innerHTML = `
    <p>회원탈퇴 하시겠습니까?</p>
    <p class="sub-text">작성된 게시글과 댓글은 삭제됩니다.</p>
    <div class="button-container">
      <button class="cancel">취소</button>
      <button class="confirm">확인</button>
    </div>
  `;

  dialog.querySelector(".cancel").addEventListener("click", () => {
    overlay.remove();
  });

  dialog.querySelector(".confirm").addEventListener("click", () => {
    callback();
    overlay.remove();
  });

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
}

function setupWithdrawal() {
  const withdrawalBtn = document.querySelector(".withdrawl-btn");

  withdrawalBtn.addEventListener("click", function () {
    showWithdrawlConfirmDialog(async () => {
      const { userId } = getCurrentUser();

      try {
        const response = await fetch(`/users/${userId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("회원 탈퇴 실패");
        }

        window.location.href = "../sign/sign-in.html";
      } catch (error) {
        console.error("회원 탈퇴 중 오류 발생:", error);
        alert("회원 탈퇴에 실패했습니다.");
      }
    });
  });
}

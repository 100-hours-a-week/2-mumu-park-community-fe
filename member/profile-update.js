document.addEventListener("DOMContentLoaded", async function () {
  const profileImage = document.querySelector(".profile-image img");
  const userInfo = await getUserInfo();

  if (profileImage) {
    profileImage.src = userInfo.profileImg;
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
  setupProfileImageUpdate(profileImage);
  // 폼 제출 이벤트 설정
  setupFormSubmission();
  // 회원탈퇴 버튼 설정
  setupWithdrawal();
});

async function fetchUserProfile() {
  try {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return redirectToLogin();

    const response = await fetch("http://127.0.0.1:8080/users", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok)
      throw new Error(`Error: ${response.status} ${response.statusText}`);

    const result = await response.json();
    return result.data;
  } catch (error) {
    alert("Error fetching user profile: " + error.message);
    return null;
  }
}

function redirectToLogin() {
  alert("로그인이 필요합니다.");
  window.location.href = "../sign/sign-in.html";
}

function setupProfileImageUpdate(profileImageInfo) {
  const imagePreview = document.getElementById("imagePreview");
  const fileInput = document.getElementById("profile-image");
  const previewImg = document.getElementById("previewImg");
  let imageDownloadUrl = null; // 업로드된 이미지의 URL을 저장할 변수

  if (previewImg) {
    previewImg.src = profileImageInfo.src;
    previewImg.alt = `profileImg`;
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
        // uploadImage 함수 호출하여 이미지 업로드하고 URL 받기
        imageDownloadUrl = await uploadImage(file);

        // 미리보기 이미지 업데이트
        previewImg.style.display = "block";
        previewImg.src = imageDownloadUrl; // 다운로드 URL로 이미지 소스 설정

        if (altText) altText.style.display = "none";
        imagePreview.style.backgroundColor = "transparent";
        if (helperText) helperText.style.display = "none";

        // 폼의 상태 업데이트 - 이제 이미지가 업로드되었으므로 폼이 유효한지 확인
        validateForm();
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        alert("이미지 업로드에 실패했습니다.");

        // 업로드 실패 시 기본 상태로 되돌리기
        previewImg.style.display = "none";
        if (altText) altText.style.display = "block";
        imagePreview.style.backgroundColor = "#ccc";
        if (helperText) {
          helperText.textContent = "* 프로필 사진 업로드에 실패했습니다.";
          helperText.style.display = "block";
        }
      }
    } else {
      previewImg.style.display = "none";
      previewImg.src = "";
      imageDownloadUrl = null;
      if (altText) altText.style.display = "block";
      imagePreview.style.backgroundColor = "#ccc";
      if (helperText) {
        helperText.textContent = "* 프로필 사진을 추가해주세요.";
        helperText.style.display = "block";
      }
    }
    validateForm();
  });

  // 이미지 URL 접근을 위한 함수 추가
  window.getImageDownloadUrl = function () {
    console.log(`imageDownloadUrl: ${imageDownloadUrl}`);
    return imageDownloadUrl;
  };
}

function validateForm() {
  const nicknameInput = document.getElementById("nickname");
  const submitButton = document.querySelector(".update-btn");

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
  const form = document.getElementById("update-btn");
  const nicknameInput = document.getElementById("nickname");

  validateForm();

  nicknameInput.addEventListener("input", function () {
    validateNickname(this.value);
    validateForm();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nickname = nicknameInput.value;
    console.log(`nickname: ${nickname}`);

    if (validateForm()) {
      // 이미지 URL 가져오기
      const imageUrl =
        window.getImageDownloadUrl() ||
        document.getElementById("previewImg").src;

      updateProfile({
        nickname: nickname,
        profileImg: imageUrl, // 업로드된 이미지 URL 또는 기존 이미지 사용
      });
    }
  });
}

async function updateProfile(updateData) {
  const token = sessionStorage.getItem("accessToken");

  try {
    const response = await fetch(`http://127.0.0.1:8080/users`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error("프로필 수정 실패");
    }

    showToast("수정이 완료되었습니다.");
    setTimeout(() => {
      window.location.href = "../board/main/main.html";
    }, 2000);
  } catch (error) {
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
      const token = sessionStorage.getItem("accessToken");

      try {
        const response = await fetch(`http://127.0.0.1:8080/users/${userId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("회원 탈퇴 실패");
        }

        window.location.href = "../sign/sign-in.html";
      } catch (error) {
        alert("회원 탈퇴에 실패했습니다.");
      }
    });
  });
}

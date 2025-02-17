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

  // 현재 이메일 표시
  const emailElement = document.querySelector(".input-group p");
  if (emailElement) {
    emailElement.textContent = currentUser.email;
  }

  // 현재 닉네임 표시
  const nicknameInput = document.getElementById("nickname");
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const currentUserData = users.find(
    (user) => user.email === currentUser.email
  );

  if (nicknameInput && currentUserData && currentUserData.nickname) {
    nicknameInput.value = currentUserData.nickname;
  }

  // 프로필 드롭다운 설정
  setupProfileDropdown();

  // 프로필 이미지 업데이트 설정
  setupProfileImageUpdate();

  // 폼 제출 이벤트 설정
  setupFormSubmission();

  // 회원탈퇴 버튼 설정
  setupWithdrawal();
});

function setupProfileDropdown() {
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

  const dropdownItems = document.querySelectorAll(".dropdown-item");
  dropdownItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.stopPropagation();
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
}

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

function setupProfileImageUpdate() {
  const imagePreview = document.getElementById("imagePreview");
  const fileInput = document.getElementById("profile-image");
  const previewImg = document.getElementById("previewImg");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // 초기 프로필 이미지 설정 (수정 페이지의 프로필 이미지)
  if (previewImg) {
    previewImg.src = currentUser.profileImage || "../photo/profile_mumu.jpeg";
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
      // 파일 선택이 취소된 경우
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
  const previewImg = document.getElementById("previewImg");
  const nicknameInput = document.getElementById("nickname");
  const submitButton = document.querySelector(".update-btn");

  // 기존 사용자 데이터 가져오기
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const currentUserData = users.find(
    (user) => user.email === currentUser.email
  );

  // 닉네임 변경 여부 확인
  const isNicknameChanged =
    currentUserData && currentUserData.nickname !== nicknameInput.value;

  // 닉네임 유효성 검사
  const isNicknameValid = validateNickname(nicknameInput.value);
  // 버튼 상태 업데이트
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

  // 초기 폼 상태 확인
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

function validateNickname(nickname) {
  const helperText = document.querySelector(".helper-text");

  if (!nickname) {
    helperText.textContent = "* 닉네임을 입력해주세요.";
    helperText.style.display = "block";
    return false;
  }

  if (nickname.length < 2 || nickname.length > 10) {
    helperText.textContent = "* 닉네임은 2자 이상 10자 이하여야 합니다.";
    helperText.style.display = "block";
    return false;
  }

  helperText.style.display = "none";
  return true;
}

function updateProfile(updateData) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const userIndex = users.findIndex((u) => u.email === currentUser.email);

  if (userIndex !== -1) {
    // users 배열 업데이트
    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("users", JSON.stringify(users));

    // 현재 로그인 사용자 정보 업데이트
    const updatedUser = {
      ...currentUser,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    // 헤더의 프로필 이미지 즉시 업데이트
    const headerProfileImg = document.querySelector(".profile-image img");
    if (headerProfileImg && updateData.profileImage) {
      headerProfileImg.src = updateData.profileImage;
    }

    showToast("수정이 완료되었습니다.");
    setTimeout(() => {
      window.location.href = "../board/main/main.html";
    }, 3000);
  } else {
    alert("사용자 정보를 찾을 수 없습니다.");
  }
}

function setupWithdrawal() {
  const withdrawalBtn = document.querySelector(".withdrawl-btn");

  withdrawalBtn.addEventListener("click", function () {
    if (confirm("정말로 탈퇴하시겠습니까?")) {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const users = JSON.parse(localStorage.getItem("users")) || [];

      const updatedUsers = users.filter(
        (user) => user.email !== currentUser.email
      );
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      localStorage.removeItem("currentUser");

      window.location.href = "../sign/sign-in.html";
    }
  });
}

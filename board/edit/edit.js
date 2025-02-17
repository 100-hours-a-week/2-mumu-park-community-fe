document.addEventListener("DOMContentLoaded", function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    window.location.href = "../sign/sign-in.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");

  // 뒤로가기 버튼에 postId 추가
  const backButton = document.querySelector(".back-button");
  backButton.onclick = function () {
    window.location.href = `../detail/detail.html?id=${postId}`;
  };

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
          window.location.href = "../profile/change-password.html";
          break;
        case "로그아웃":
          localStorage.removeItem("currentUser");
          window.location.href = "../../sign/sign-in.html";
          break;
      }
    });
  });

  loadPostData(postId);
  setupForm(postId);
});

function loadPostData(postId) {
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    alert("게시글을 찾을 수 없습니다.");
    window.location.href = "../main/main.html";
    return;
  }

  document.getElementById("title").value = post.title;
  document.getElementById("content").value = post.content;

  // 이미지와 파일명이 있는 경우
  if (post.imageUrl && post.imageFileName) {
    // DataURL을 Blob으로 변환
    const byteString = atob(post.imageUrl.split(",")[1]);
    const mimeString = post.imageUrl.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ab], { type: mimeString });

    // 저장된 파일명으로 File 객체 생성
    const file = new File([blob], post.imageFileName, { type: mimeString });

    // input file에 파일 설정
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    document.getElementById("image").files = dataTransfer.files;
  }
}

function setupForm(postId) {
  const form = document.querySelector("form");
  const titleInput = document.getElementById("title");
  const contentTextarea = document.getElementById("content");
  const imageInput = document.getElementById("image");
  const helperText = contentTextarea.nextElementSibling;

  // 제목 글자수 제한
  titleInput.addEventListener("input", function (e) {
    if (this.value.length > 26) {
      this.value = this.value.substring(0, 26);
    }
  });

  contentTextarea.addEventListener("input", function () {
    const content = this.value.trim();
    if (!content) {
      helperText.textContent = "* 제목, 내용을 모두 작성해주세요";
      helperText.style.display = "block";
    } else {
      helperText.style.display = "none";
    }
    updateSubmitButton();
  });

  // blur 이벤트 처리 (focus를 잃었을 때)
  contentTextarea.addEventListener("blur", function () {
    const content = this.value.trim();
    if (!content) {
      helperText.textContent = "* 제목, 내용을 모두 작성해주세요";
      helperText.style.display = "block";
    }
  });

  // 이미지 변경 시 미리보기 업데이트
  imageInput.addEventListener("change", async function (e) {
    const file = e.target.files[0];
    if (file) {
      try {
        const preview = document.querySelector("#imagePreview img");
        preview.src = URL.createObjectURL(file);
        preview.style.display = "block";
      } catch (error) {
        console.error("이미지 미리보기 생성 중 오류:", error);
      }
    }
  });

  // 폼 제출
  // 폼 제출
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = titleInput.value.trim();
    const content = contentTextarea.value.trim();

    const posts = JSON.parse(localStorage.getItem("posts"));
    const postIndex = posts.findIndex((p) => p.id === postId);

    if (postIndex === -1) {
      alert("게시글을 찾을 수 없습니다.");
      return;
    }

    let imageUrl = null; // 기본값을 null로 설정
    let imageFileName = null; // 파일명도 null로 설정

    // 새로운 이미지가 선택된 경우
    if (imageInput.files[0]) {
      try {
        imageUrl = await compressImage(imageInput.files[0]);
        imageFileName = imageInput.files[0].name;
      } catch (error) {
        console.error("이미지 압축 중 오류:", error);
        alert("이미지 처리 중 오류가 발생했습니다.");
        return;
      }
    }

    // 게시글 업데이트
    posts[postIndex] = {
      ...posts[postIndex],
      title,
      content,
      imageUrl, // null이면 이미지 없음
      imageFileName, // null이면 파일명도 없음
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem("posts", JSON.stringify(posts));
    window.location.href = `../detail/detail.html?id=${postId}`;
  });

  function updateSubmitButton() {
    const submitButton = form.querySelector('button[type="submit"]');
    const title = titleInput.value.trim();
    const content = contentTextarea.value.trim();

    if (title && content) {
      submitButton.style.backgroundColor = "#7F6AEE";
      submitButton.disabled = false;
    } else {
      submitButton.style.backgroundColor = "#aca0eb";
      submitButton.disabled = true;
    }
  }

  // 초기 버튼 상태 설정
  updateSubmitButton();
}

// 이미지 압축 함수는 post.js와 동일
async function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const MAX_SIZE = 800;
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

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
        resolve(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

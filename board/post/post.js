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

  setupForm();
});

function setupForm() {
  const form = document.querySelector("form");
  const titleInput = document.getElementById("title");
  const contentTextarea = document.getElementById("content");
  const imageInput = document.getElementById("image");
  const helperText = contentTextarea.nextElementSibling; // helper text p태그

  // 제목 글자수 제한 처리
  titleInput.addEventListener("input", function (e) {
    if (this.value.length > 26) {
      this.value = this.value.substring(0, 26);
    }
  });

  // 폼 제출 처리
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = titleInput.value.trim();
    const content = contentTextarea.value.trim();

    // 현재 사용자 정보 가져오기
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    let imageUrl = "";
    let imageFileName = "";

    if (imageInput.files[0]) {
      try {
        // 이미지 압축 적용
        imageUrl = await compressImage(imageInput.files[0]);
        imageFileName = imageInput.files[0].name;
      } catch (error) {
        console.error("이미지 압축 중 오류:", error);
        alert("이미지 처리 중 오류가 발생했습니다.");
        return;
      }
    }

    // 새 게시글 객체 생성
    const newPost = {
      id: Date.now().toString(),
      title,
      content,
      imageUrl,
      imageFileName,
      authorEmail: currentUser.email,
      authorNickname: currentUser.nickname,
      createdAt: new Date().toISOString(),
      likes: 0,
      views: 0,
      comments: [],
    };

    // localStorage에서 기존 게시글 가져오기
    const posts = JSON.parse(localStorage.getItem("posts")) || [];

    // 새 게시글 추가
    posts.push(newPost);

    // localStorage 업데이트
    localStorage.setItem("posts", JSON.stringify(posts));

    // 메인 페이지로 이동
    window.location.href = "../main/main.html";
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

  // 버튼 활성화/비활성화 처리
  function updateSubmitButton() {
    const submitButton = form.querySelector('button[type="submit"]');
    const title = titleInput.value.trim();
    const content = contentTextarea.value.trim();

    if (title && content) {
      submitButton.style.backgroundColor = "#7F6AEE";
      submitButton.disabled = false;
      helperText.style.display = "none"; // 내용이 있으면 helper text 숨기기
    } else {
      submitButton.style.backgroundColor = "#aca0eb";
      submitButton.disabled = true;
      if (!content) {
        helperText.textContent = "* 제목, 내용을 모두 작성해주세요";
        helperText.style.display = "block";
      }
    }
  }

  // 입력 필드 변경 감지
  titleInput.addEventListener("input", updateSubmitButton);
  contentTextarea.addEventListener("input", updateSubmitButton);

  // 초기 버튼 상태 설정
  updateSubmitButton();
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

        // 최대 크기 지정 (예: 800px로 수정 - 게시글 이미지는 더 크게)
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

        // 이미지 품질 조정 (0.8 = 80% 품질로 수정 - 게시글 이미지는 더 높은 품질)
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
        resolve(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

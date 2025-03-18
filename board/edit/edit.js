document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");

  const backButton = document.querySelector(".back-button");
  backButton.onclick = function () {
    window.location.href = `../detail/detail.html?id=${postId}`;
  };

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
  await loadPostData(postId);
  setupForm(postId);
});

async function loadPostData(postId) {
  const response = await fetch("../../data/board.json");
  const posts = await response.json();
  const post = posts.find((p) => p.id === postId);

  // Todo : 추후 서버생기면 게시글 상세정보 가져오기
  // const postData = await fetchPostDetail(postId);

  document.getElementById("title").value = post.title;
  document.getElementById("content").value = post.content;

  if (post.imageUrl && post.imgFileName) {
    const byteString = atob(post.imageUrl.split(",")[1]);
    const mimeString = post.imageUrl.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ab], { type: mimeString });

    const file = new File([blob], post.imageFileName, { type: mimeString });

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

  titleInput.addEventListener("input", function (event) {
    limitTitleLength(event);

    const title = this.value.trim();
    if (!title) {
      helperText.textContent = "* 제목, 내용을 모두 작성해주세요";
      helperText.style.display = "block";
    } else {
      helperText.style.display = "none";
    }
    updateSubmitButton();
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

  contentTextarea.addEventListener("blur", function () {
    const content = this.value.trim();
    if (!content) {
      helperText.textContent = "* 제목, 내용을 모두 작성해주세요";
      helperText.style.display = "block";
    }
  });

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

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = titleInput.value.trim();
    const content = contentTextarea.value.trim();

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

    // Todo : 추후 서버 생기면 리팩토링
    // await updatePost({ userId, postId, title, content, imageUrl, imageFileName });

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
  updateSubmitButton();
}

async function updatePost(post) {
  try {
    const response = await fetch(`/boards/${post.postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Update Post failed:", error);
    throw error;
  }
}

async function fetchPostDetail(postId) {
  try {
    const response = await fetch(`http://127.0.0.1:8080/boards/{postId}`);

    if (!response.ok) {
      throw new Error("error creating");
    }

    const result = await response.json();
    return result.data;
  } catch (err) {
    console.error("게시글 가져오는 중 오류 발생:", err);
    return false;
  }
}

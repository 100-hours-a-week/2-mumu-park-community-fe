document.addEventListener("DOMContentLoaded", function () {
  setupProfile();
  dropdownSetting();
  setupForm();
});

async function setupProfile() {
  const profileImage = document.querySelector(".profile-image img");
  const userInfo = await getUserInfo();
  if (profileImage) {
    profileImage.src = userInfo.profileImg;
    profileImage.alt = `profileImg`;
  }
}

function setupForm() {
  const form = document.querySelector("form");
  if (!form) return;

  const titleInput = document.getElementById("title");
  const contentTextarea = document.getElementById("content");
  const imageInput = document.getElementById("image");
  const helperText = contentTextarea.nextElementSibling;

  titleInput.addEventListener("input", limitTitleLength);
  contentTextarea.addEventListener("input", handleContentInput);
  contentTextarea.addEventListener("blur", validateContent);
  form.addEventListener("submit", handleSubmit);

  updateSubmitButton();
}

function handleContentInput() {
  validateContent();
  updateSubmitButton();
}

function validateContent() {
  const contentTextarea = document.getElementById("content");
  const helperText = contentTextarea.nextElementSibling;
  const content = contentTextarea.value.trim();

  if (!content) {
    helperText.textContent = "* 제목, 내용을 모두 작성해주세요";
    helperText.style.display = "block";
  } else {
    helperText.style.display = "none";
  }
}

function updateSubmitButton() {
  const form = document.querySelector("form");
  const submitButton = form.querySelector('button[type="submit"]');
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  const helperText = document.getElementById("content").nextElementSibling;

  if (title && content) {
    submitButton.style.backgroundColor = "#7F6AEE";
    submitButton.disabled = false;
    helperText.style.display = "none";
  } else {
    submitButton.style.backgroundColor = "#aca0eb";
    submitButton.disabled = true;
    if (!content) {
      helperText.textContent = "* 제목, 내용을 모두 작성해주세요";
      helperText.style.display = "block";
    }
  }
}

async function handleSubmit(e) {
  e.preventDefault();

  const titleInput = document.getElementById("title");
  const contentTextarea = document.getElementById("content");
  const imageInput = document.getElementById("image");

  const title = titleInput.value.trim();
  const content = contentTextarea.value.trim();

  let imageUrl = "";
  let imageFileName = "";

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

  const newPost = createPostObject(title, content, imageUrl, imageFileName);

  await savePost(newPost);

  window.location.href = "../main/main.html";
}

function createPostObject(title, content, imageUrl, imageFileName) {
  return {
    title,
    content,
    imageUrl,
    imageFileName,
  };
}

async function savePost(post) {
  const token = sessionStorage.getItem("accessToken");
  console.log(`accessToken: ${token})`);
  try {
    const response = await fetch("http://127.0.0.1:8080/boards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(post),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Boards Post failed:", error);
    alert("Boards Post failed");
    throw error;
  }
}

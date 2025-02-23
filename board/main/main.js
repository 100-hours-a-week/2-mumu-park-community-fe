document.addEventListener("DOMContentLoaded", async function () {
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
  await displayPosts();
});

async function displayPosts() {
  const postsContainer = document.querySelector(".posts");
  postsContainer.innerHTML = "";

  const posts = await fetchPosts();
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  posts.forEach((post) => {
    const postElement = createPostElement(post);
    postsContainer.appendChild(postElement);
  });
}

function limitTitle(title) {
  if (title.length > 26) {
    return title.substring(0, 26);
  }
  return title;
}

function createPostElement(post) {
  const article = document.createElement("article");
  article.className = "post-card";

  article.innerHTML = `
      <h2>${post.title}</h2>
      <div class="post-meta">
          <div class="post-meta-left">
              <span>좋아요 ${formatNumber(post.likes || 0)}</span>
              <span>댓글 ${formatNumber(post.comments?.length || 0)}</span>
              <span>조회수 ${formatNumber(post.views || 0)}</span>
          </div>
          <span class="post-date">${formatDate(post.createdAt)}</span>
      </div>
      <div class="user-info">
          <div class="avatar">
              <img src="${
                post.profileImage || "../../photo/profile_mumu.jpeg"
              }" 
                alt="author profile" 
                style="width: 30px; height: 30px; border-radius: 50%;">
          </div>
          <span class="username"><strong>${post.authorNickname}</strong></span>
      </div>
  `;

  article.addEventListener("click", () => {
    window.location.href = `../detail/detail.html?id=${post.id}`;
  });

  return article;
}

async function fetchPosts() {
  try {
    const response = await fetch("../../data/board.json");
    // const response = await fetch('/boards');

    if (!response.ok) {
      throw new Error("error creating");
    }

    return await response.json();
    // const result = await response.json(); // JSON 파싱
    // return result.data;
  } catch (err) {
    console.error("게시글 가져오는 중 오류 발생:", err);
    return false;
  }
}

async function fetchUsers() {}

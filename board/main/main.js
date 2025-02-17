document.addEventListener("DOMContentLoaded", function () {
  // 현재 로그인된 사용자 정보 가져오기
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    window.location.href = "../sign/sign-in.html";
    return;
  }

  // 프로필 이미지 업데이트
  const profileImage = document.querySelector(".profile-image img");
  if (profileImage) {
    profileImage.src = currentUser.profileImage;
    profileImage.alt = `${currentUser.email}'s profile`;
  }

  displayPosts();
});

function displayPosts() {
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const postsContainer = document.querySelector(".posts");

  // 최신 게시글이 위에 오도록 정렬
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // 기존 게시글 삭제
  postsContainer.innerHTML = "";

  posts.forEach((post) => {
    const postElement = createPostElement(post);
    postsContainer.appendChild(postElement);
  });
}

// 숫자 포맷팅 (1k, 10k, 100k)
function formatNumber(num) {
  if (num >= 100000) {
    return Math.floor(num / 1000) + "k";
  } else if (num >= 10000) {
    return Math.floor(num / 1000) + "k";
  } else if (num >= 1000) {
    return Math.floor(num / 1000) + "k";
  }
  return num.toString();
}

// 날짜 포맷팅 (yyyy-mm-dd hh:mm:ss)
function formatDate(date) {
  const d = new Date(date);
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0") +
    " " +
    String(d.getHours()).padStart(2, "0") +
    ":" +
    String(d.getMinutes()).padStart(2, "0") +
    ":" +
    String(d.getSeconds()).padStart(2, "0")
  );
}

// 제목 길이 제한 (26자)
function limitTitle(title) {
  if (title.length > 26) {
    return title.substring(0, 26);
  }
  return title;
}

function createPostElement(post) {
  const article = document.createElement("article");
  article.className = "post-card";

  // 게시글 작성자 정보 가져오기
  const author = JSON.parse(localStorage.getItem("users")).find(
    (user) => user.email === post.authorEmail
  );

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
                author?.profileImage || "../../photo/profile_mumu.jpeg"
              }" 
                alt="author profile" 
                style="width: 30px; height: 30px; border-radius: 50%;">
          </div>
          <span class="username">${author.email}</span>
      </div>
  `;

  article.addEventListener("click", () => {
    window.location.href = `../detail/detail.html?id=${post.id}`;
  });

  return article;
}

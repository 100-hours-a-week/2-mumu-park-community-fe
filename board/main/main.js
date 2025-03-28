(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    const profileImage = document.querySelector(".profile-image img");
    if (profileImage) {
      profileImage.src = "../../photo/profile_mumu.jpeg";
      profileImage.alt = `profileImg`;
    }

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

  function createPostElement(post) {
    const article = document.createElement("article");
    article.className = "post-card";

    article.innerHTML = `
        <h2>${post.title}</h2>
        <div class="post-meta">
            <div class="post-meta-left">
                <span>좋아요 ${formatNumber(post.likeCnt || 0)}</span>
                <span>댓글 ${formatNumber(post.commentCnt || 0)}</span>
                <span>조회수 ${formatNumber(post.viewCount || 0)}</span>
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
            <span class="username"><strong>${
              post.authorNickname
            }</strong></span>
        </div>
    `;

    article.addEventListener("click", () => {
      window.location.href = `../detail/detail.html?id=${post.boardId}`;
    });

    return article;
  }

  async function fetchPosts() {
    try {
      const response = await fetch("http://127.0.0.1:8080/boards");

      if (!response.ok) {
        throw new Error("error creating");
      }

      const result = await response.json();

      // ✅ 데이터 구조 확인 후 올바르게 접근
      const posts = result.data?.boardSimpleInfos || [];

      return posts;
    } catch (err) {
      console.error("게시글 가져오는 중 오류 발생:", err);
      alert("게시글 가져오는 중 오류 발생");

      return []; // ❌ false 대신 빈 배열 반환 (forEach 에러 방지)
    }
  }
})();

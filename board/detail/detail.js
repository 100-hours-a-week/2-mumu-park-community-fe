document.addEventListener("DOMContentLoaded", function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    window.location.href = "../../sign/sign-in.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");

  // 프로필 이미지 업데이트
  const profileImage = document.querySelector(".profile-image img");
  if (profileImage) {
    profileImage.src = currentUser.profileImage || "../photo/profile_mumu.jpeg";
    profileImage.alt = `${currentUser.email}'s profile`;
  }

  loadAndDisplayPost(postId);
  setupCommentSubmission(postId);
});

function formatNumber(num) {
  if (num >= 100000) return Math.floor(num / 1000) + "k";
  if (num >= 10000) return Math.floor(num / 1000) + "k";
  if (num >= 1000) return Math.floor(num / 1000) + "k";
  return num.toString();
}

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

function loadAndDisplayPost(postId) {
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    alert("게시글을 찾을 수 없습니다.");
    window.location.href = "../main/main.html";
    return;
  }

  const author = JSON.parse(localStorage.getItem("users")).find(
    (user) => user.email === post.authorEmail
  );

  displayPostContent(post, author);
  displayComments(post);
  setupPostActions(post);
}

function displayPostContent(post, author) {
  document.querySelector("h2").textContent = post.title;
  document.querySelector(".author-info span").textContent = author.nickname;
  document.querySelector(".author-info img").src =
    author?.profileImage || "../photo/profile_mumu.jpeg";
  document.querySelector(".date").textContent = formatDate(post.createdAt);
  document.querySelector(".content-text").textContent = post.content;

  const postImage = document.querySelector(".post-image");
  const imageContainer = document.querySelector(".image-container");

  if (post.imageUrl) {
    postImage.src = post.imageUrl;
    postImage.style.display = "block";
    imageContainer.style.display = "flex";

    // 이미지 로드 완료 후 크기 조정
    postImage.onload = function () {
      const ratio = this.naturalWidth / this.naturalHeight;

      if (ratio > 1) {
        // 가로가 더 긴 이미지
        if (this.naturalWidth > 800) {
          imageContainer.style.width = "800px";
        } else {
          imageContainer.style.width = this.naturalWidth + "px";
        }
      } else {
        // 세로가 더 긴 이미지
        const maxHeight = 600;
        if (this.naturalHeight > maxHeight) {
          imageContainer.style.width = maxHeight * ratio + "px";
        } else {
          imageContainer.style.width = this.naturalWidth + "px";
        }
      }
    };
  } else {
    postImage.style.display = "none";
    imageContainer.style.display = "none";
  }

  // 통계 업데이트
  const statButtons = document.querySelectorAll(".stat-button");
  const likeButton = statButtons[0];

  // 현재 사용자의 좋아요 상태 확인
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const hasLiked = post.likedBy?.includes(currentUser.email);

  // 좋아요 버튼 초기 상태 설정
  likeButton.style.backgroundColor = hasLiked ? "#ACA0EB" : "#D9D9D9";
  likeButton.querySelector("span").textContent = formatNumber(post.likes || 0);

  // 나머지 통계 버튼 업데이트
  statButtons[1].querySelector("span").textContent = formatNumber(
    post.views || 0
  );
  statButtons[2].querySelector("span").textContent = formatNumber(
    post.comments?.length || 0
  );

  // 좋아요 버튼 이벤트
  likeButton.addEventListener("click", () => toggleLike(post));
}

function displayComments(post) {
  const commentList = document.querySelector(".comment-list");
  commentList.innerHTML = "";

  post.comments?.forEach((comment) => {
    const commentElement = createCommentElement(comment);
    commentList.appendChild(commentElement);
  });
}

function createCommentElement(comment) {
  const commentDiv = document.createElement("div");
  commentDiv.className = "comment";

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const isAuthor = comment.authorEmail === currentUser.email;

  const commentAuthor = JSON.parse(localStorage.getItem("users")).find(
    (user) => user.email === comment.authorEmail
  );

  commentDiv.innerHTML = `
    <div class="comment-container">
      <div class="comment-left">
        <img src="${
          commentAuthor?.profileImage || "../photo/profile_mumu.jpeg"
        }" alt="commenter" class="commenter-image">
        <span class="commenter-name"><strong>${
          commentAuthor.nickname
        }</strong></span>
        <span class="comment-date">${formatDate(comment.createdAt)}</span>
      </div>
      ${
        isAuthor
          ? `
        <div class="comment-right">
          <button class="action-btn edit-comment" data-id="${comment.id}">수정</button>
          <button class="action-btn delete-comment" data-id="${comment.id}">삭제</button>
        </div>
      `
          : ""
      }
    </div>
    <p class="comment-text">${comment.content}</p>
  `;

  if (isAuthor) {
    // 수정 버튼 이벤트
    commentDiv.querySelector(".edit-comment").addEventListener("click", () => {
      window.editComment(comment);
    });

    // 삭제 버튼 이벤트
    commentDiv
      .querySelector(".delete-comment")
      .addEventListener("click", () => {
        showDeleteConfirmDialog(() => deleteComment(comment));
      });
  }

  return commentDiv;
}

function deleteComment(comment) {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");

  const posts = JSON.parse(localStorage.getItem("posts"));
  const postIndex = posts.findIndex((p) => p.id === postId);

  if (postIndex !== -1) {
    // 해당 댓글 찾아서 삭제
    posts[postIndex].comments = posts[postIndex].comments.filter(
      (c) => c.id !== comment.id
    );

    // localStorage 업데이트
    localStorage.setItem("posts", JSON.stringify(posts));

    // UI 업데이트
    displayComments(posts[postIndex]);
  }
}

function showDeleteConfirmDialog(callback) {
  const overlay = document.createElement("div");
  overlay.className = "dialog-overlay";

  const dialog = document.createElement("div");
  dialog.className = "confirm-dialog";
  dialog.innerHTML = `
    <p>게시글을 삭제하시겠습니까?</p>
    <p class="sub-text">삭제한 내용은 복구 할 수 없습니다.</p>
    <div class="button-container">
      <button class="cancel">취소</button>
      <button class="confirm">확인</button>
    </div>
  `;

  // 취소 버튼
  dialog.querySelector(".cancel").addEventListener("click", () => {
    overlay.remove();
  });

  // 확인 버튼
  dialog.querySelector(".confirm").addEventListener("click", () => {
    callback();
    overlay.remove();
  });

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
}

function setupPostActions(post) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const actionButtons = document.querySelector(".post-actions");

  if (post.authorEmail !== currentUser.email) {
    actionButtons.style.display = "none";
    return;
  }

  // 수정 버튼
  actionButtons
    .querySelector("button:first-child")
    .addEventListener("click", () => {
      window.location.href = `../edit/edit.html?id=${post.id}`;
    });

  // 삭제 버튼
  actionButtons
    .querySelector("button:last-child")
    .addEventListener("click", () => {
      showDeleteConfirmDialog(() => deletePost(post));
    });
}

function deletePost(post) {
  const posts = JSON.parse(localStorage.getItem("posts"));
  const updatedPosts = posts.filter((p) => p.id !== post.id);
  localStorage.setItem("posts", JSON.stringify(updatedPosts));
  window.location.href = "../main/main.html";
}

function toggleLike(post) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const posts = JSON.parse(localStorage.getItem("posts"));
  const postIndex = posts.findIndex((p) => p.id === post.id);

  if (!posts[postIndex].likedBy) {
    posts[postIndex].likedBy = [];
  }

  const likeButton = document.querySelectorAll(".stat-button")[0];
  const userLikeIndex = posts[postIndex].likedBy.indexOf(currentUser.email);

  if (userLikeIndex === -1) {
    // 좋아요 추가
    posts[postIndex].likedBy.push(currentUser.email);
    posts[postIndex].likes = (posts[postIndex].likes || 0) + 1;
    likeButton.style.backgroundColor = "#ACA0EB"; // 활성화 상태 색상
  } else {
    // 좋아요 취소
    posts[postIndex].likedBy.splice(userLikeIndex, 1);
    posts[postIndex].likes = (posts[postIndex].likes || 1) - 1;
    likeButton.style.backgroundColor = "#D9D9D9"; // 비활성화 상태 색상
  }

  localStorage.setItem("posts", JSON.stringify(posts));

  // 좋아요 수 업데이트
  const likeCount = likeButton.querySelector("span");
  likeCount.textContent = formatNumber(posts[postIndex].likes || 0);
}

function setupCommentSubmission(postId) {
  const commentForm = document.querySelector(".comment-input-container");
  const textarea = commentForm.querySelector("textarea");
  const submitButton = commentForm.querySelector(".comment-submit");
  let editingCommentId = null; // 현재 수정 중인 댓글 ID 저장

  // 초기 버튼 상태 설정
  submitButton.style.backgroundColor = "#d9d9d9";
  submitButton.disabled = true;

  // textarea 입력 이벤트 리스너
  textarea.addEventListener("input", () => {
    const hasContent = textarea.value.trim().length > 0;
    submitButton.style.backgroundColor = hasContent ? "#7f6aee" : "#d9d9d9";
    submitButton.disabled = !hasContent;
  });

  // 댓글 제출 이벤트
  submitButton.addEventListener("click", () => {
    const content = textarea.value.trim();
    if (!content) return;

    const posts = JSON.parse(localStorage.getItem("posts"));
    const postIndex = posts.findIndex((p) => p.id === postId);
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (editingCommentId) {
      // 댓글 수정 모드
      const commentIndex = posts[postIndex].comments.findIndex(
        (c) => c.id === editingCommentId
      );
      if (commentIndex !== -1) {
        posts[postIndex].comments[commentIndex].content = content;
      }
      editingCommentId = null; // 수정 모드 해제
    } else {
      // 새 댓글 작성 모드
      const newComment = {
        id: Date.now().toString(),
        authorEmail: currentUser.email,
        content: content,
        createdAt: new Date().toISOString(),
      };

      if (!posts[postIndex].comments) {
        posts[postIndex].comments = [];
      }
      posts[postIndex].comments.push(newComment);
    }

    localStorage.setItem("posts", JSON.stringify(posts));

    // 입력창 초기화 및 버튼 상태 변경
    textarea.value = "";
    submitButton.style.backgroundColor = "#d9d9d9";
    submitButton.disabled = true;
    submitButton.textContent = "댓글 등록"; // 버튼 텍스트 원래대로

    // 댓글 목록 갱신
    displayComments(posts[postIndex]);
  });

  // 댓글 수정 함수 (외부에서 호출)
  window.editComment = function (comment) {
    textarea.value = comment.content;
    editingCommentId = comment.id;
    textarea.focus();
    submitButton.textContent = "댓글 수정";
    submitButton.style.backgroundColor = "#7f6aee";
    submitButton.disabled = false;
  };
}

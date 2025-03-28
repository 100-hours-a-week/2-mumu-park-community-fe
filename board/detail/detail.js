document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");

  const profileImage = document.querySelector(".profile-image img");
  if (profileImage) {
    profileImage.src = "../../photo/profile_mumu.jpeg";
    profileImage.alt = `profileImg`;
  }

  dropdownSetting();
  loadAndDisplayPost(postId);
  setupCommentSubmission(postId);
});

async function loadAndDisplayPost(postId) {
  const post = await fetchPostDetail(postId);

  displayPostContent(post.boardDetail);
  displayComments(post.comments);
  await setupPostActions(post.boardDetail);

  // 로그인한 사용자의 좋아요 상태 확인 및 버튼 설정
  const token = sessionStorage.getItem("accessToken");
  if (token) {
    updateLikeButtonState(post.boardDetail.boardId);
  }
}

async function updateLikeButtonState(postId) {
  try {
    const isLiked = await isBoardLikes(postId);
    const likeButton = document.querySelectorAll(".stat-button")[0];

    // 좋아요 상태에 따라 버튼 색상 변경
    likeButton.style.backgroundColor = isLiked ? "#ACA0EB" : "#D9D9D9";
  } catch (error) {
    console.error("좋아요 상태 업데이트 중 오류 발생:", error);
  }
}

async function toggleLike(post) {
  try {
    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요한 기능입니다.");
      return;
    }

    // 현재 좋아요 상태 확인
    const isLiked = await isBoardLikes(post.boardId);

    // 좋아요 토글 요청
    const response = await fetch(
      `http://127.0.0.1:8080/boards/${post.boardId}/likes`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isLikeCancel: isLiked, // true면 좋아요 취소, false면 좋아요 등록
        }),
      }
    );

    if (!response.ok) {
      throw new Error("좋아요 처리 실패");
    }

    // 좋아요 상태 및 버튼 업데이트
    await updateLikeButtonState(post.boardId);

    // 좋아요 수 업데이트
    const updatedPost = await fetchPostDetail(post.boardId);
    const likeButton = document.querySelectorAll(".stat-button")[0];
    likeButton.querySelector("span").textContent = formatNumber(
      updatedPost.boardDetail.likeCnt
    );
  } catch (error) {
    console.error("좋아요 처리 중 오류 발생:", error);
    alert("좋아요 처리에 실패했습니다.");
  }
}

async function fetchPostDetail(postId) {
  try {
    const response = await fetch(`http://127.0.0.1:8080/boards/${postId}`);

    if (!response.ok) {
      throw new Error("error creating");
    }

    const result = await response.json();
    return result.data;
  } catch (err) {
    alert("게시글 가져오는 중 오류 발생:", err);
    return false;
  }
}

function displayPostContent(post) {
  document.querySelector("h2").textContent = post.title;
  document.querySelector(".author-info span").textContent = post.authorNickname;
  document.querySelector(".author-info img").src =
    "../../photo/profile_mumu.jpeg";

  document.querySelector(".date").textContent = formatDate(post.createdAt);
  document.querySelector(".content-text").textContent = post.content;

  const postImage = document.querySelector(".post-image");
  const imageContainer = document.querySelector(".image-container");

  if (post.imageUrl) {
    postImage.src = post.imageUrl;
    postImage.style.display = "block";
    imageContainer.style.display = "flex";

    postImage.onload = function () {
      const ratio = this.naturalWidth / this.naturalHeight;

      if (ratio > 1) {
        if (this.naturalWidth > 800) {
          imageContainer.style.width = "800px";
        } else {
          imageContainer.style.width = this.naturalWidth + "px";
        }
      } else {
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

  const statButtons = document.querySelectorAll(".stat-button");
  const likeButton = statButtons[0];

  // likeButton.style.backgroundColor = hasLiked ? "#ACA0EB" : "#D9D9D9";
  likeButton.style.backgroundColor = "#ACA0EB";
  likeButton.querySelector("span").textContent = formatNumber(post.likeCnt);

  statButtons[1].querySelector("span").textContent = formatNumber(
    post.viewCount || 0
  );
  statButtons[2].querySelector("span").textContent = formatNumber(
    post.commentCnt || 0
  );

  likeButton.addEventListener("click", () => toggleLike(post));
}

function displayComments(comments) {
  const commentList = document.querySelector(".comment-list");
  commentList.innerHTML = "";

  comments?.forEach((comment) => {
    const commentElement = createCommentElement(comment);
    commentList.appendChild(commentElement);
  });
}

function createCommentElement(comment) {
  const commentDiv = document.createElement("div");
  commentDiv.className = "comment";

  commentDiv.innerHTML = `
    <div class="comment-container">
      <div class="comment-left">
        <img src="../../photo/profile_mumu.jpeg" alt="commenter" class="commenter-image">
        <span class="commenter-name"><strong>${comment.nickname}</strong></span>
        <span class="comment-date">${formatDate(comment.updatedAt)}</span>
      </div>
      <div class="comment-right">
        <button class="action-btn edit-comment" data-id="${comment.commentId}">
          수정
        </button>
        <button class="action-btn delete-comment" data-id="${
          comment.commentId
        }">
          삭제
        </button>
      </div>
    </div>
    <p class="comment-text">${comment.content}</p>
  `;

  commentDiv.querySelector(".edit-comment").addEventListener("click", () => {
    window.editComment(comment);
  });

  commentDiv.querySelector(".delete-comment").addEventListener("click", () => {
    showDeleteConfirmDialog(() => location.reload());
  });

  commentDiv.querySelector(".delete-comment").addEventListener("click", () => {
    showDeleteConfirmDialog(() => deleteComment(comment.commentId));
  });

  return commentDiv;
}

async function deleteComment(commentId) {
  const token = sessionStorage.getItem("accessToken");

  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id"); // 현재 게시글 ID 가져오기

  try {
    const response = await fetch(
      `http://127.0.0.1:8080/boards/comments/${commentId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("댓글 삭제 실패");
    }

    alert("댓글이 삭제되었습니다.");
    location.reload();
  } catch (error) {
    console.error("댓글 삭제 중 오류 발생:", error);
    alert("댓글 삭제에 실패했습니다.");
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

async function setupPostActions(post) {
  const actionButtons = document.querySelector(".post-actions");

  actionButtons
    .querySelector("button:first-child")
    .addEventListener("click", () => {
      window.location.href = `../edit/edit.html?id=${post.boardId}`;
    });

  actionButtons
    .querySelector("button:last-child")
    .addEventListener("click", () => {
      showDeleteConfirmDialog(
        () => (window.location.href = "../main/main.html")
      );
      showDeleteConfirmDialog(async () => await deletePost(post.boardId));
    });
}

async function deletePost(postId) {
  try {
    const token = sessionStorage.getItem("accessToken");

    const response = await fetch(`http://127.0.0.1:8080/boards/${postId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("게시글 삭제 실패");
    }

    alert("게시글이 삭제되었습니다.");
    window.location.href = "../main/main.html";
  } catch (error) {
    console.error("게시글 삭제 중 오류 발생:", error);
    alert("게시글 삭제에 실패했습니다.");
  }
}

function updateLikeButton(post, userId) {
  const likeButton = document.querySelectorAll(".stat-button")[0];
  const hasLiked = post.likedBy.includes(userId);

  likeButton.style.backgroundColor = hasLiked ? "#ACA0EB" : "#D9D9D9";
  likeButton.querySelector("span").textContent = formatNumber(
    post.likedBy.length
  );
}

function setupCommentSubmission(postId) {
  const commentForm = document.querySelector(".comment-input-container");
  const textarea = commentForm.querySelector("textarea");
  const submitButton = commentForm.querySelector(".comment-submit");
  // const Button = commentForm.querySelector(".delete-action-btn");
  let editingCommentId = null;

  submitButton.style.backgroundColor = "#d9d9d9";
  submitButton.disabled = true;

  textarea.addEventListener("input", () => {
    const hasContent = textarea.value.trim().length > 0;
    submitButton.style.backgroundColor = hasContent ? "#7f6aee" : "#d9d9d9";
    submitButton.disabled = !hasContent;
  });

  submitButton.addEventListener("click", async () => {
    const content = textarea.value.trim();
    if (!content) return;

    try {
      if (editingCommentId) {
        await editCommentRequest(editingCommentId, content);
        editingCommentId = null;
      } else {
        await addCommentRequest(postId, content);
      }

      textarea.value = "";
      submitButton.style.backgroundColor = "#d9d9d9";
      submitButton.disabled = true;
      submitButton.textContent = "댓글 등록";

      location.reload();
    } catch (error) {
      console.error("댓글 처리 중 오류 발생:", error);
      alert("댓글 등록 또는 수정에 실패했습니다.");
    }
  });

  window.editComment = function (comment) {
    textarea.value = comment.content;
    editingCommentId = comment.commentId;
    textarea.focus();
    submitButton.textContent = "댓글 수정";
    submitButton.style.backgroundColor = "#7f6aee";
    submitButton.disabled = false;
  };
}

async function editCommentRequest(commentId, content) {
  const token = sessionStorage.getItem("accessToken");
  const response = await fetch(
    `http://127.0.0.1:8080/boards/comments/${commentId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        content: content,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("댓글 수정 실패");
  }
}

async function addCommentRequest(postId, content) {
  const token = sessionStorage.getItem("accessToken");

  const response = await fetch(
    `http://127.0.0.1:8080/boards/${postId}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: content,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("댓글 등록 실패");
  }
}

async function isBoardLikes(postId) {
  const token = sessionStorage.getItem("accessToken");

  try {
    const response = await fetch(
      `http://127.0.0.1:8080/boards/${postId}/likes`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();
    return result.data.isLike;
  } catch (err) {
    alert("좋아요 여부 조회 실패");
  }
}

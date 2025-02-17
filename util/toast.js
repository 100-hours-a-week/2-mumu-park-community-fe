function showToast(message) {
  // 기존 토스트 메시지 제거 (중복 방지)
  const existingToast = document.querySelector(".toast-message");
  if (existingToast) {
    existingToast.remove();
  }

  // 토스트 메시지 요소 생성
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.classList.add("toast-message");
  toast.style.position = "fixed";
  toast.style.bottom = "20px"; // 상단에서 하단으로 변경
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.backgroundColor = "rgba(0,0,0,0.7)";
  toast.style.color = "white";
  toast.style.padding = "10px 20px";
  toast.style.borderRadius = "5px";
  toast.style.zIndex = "1000";
  toast.style.opacity = "1";
  toast.style.transition = "opacity 0.5s ease-out";

  // 문서에 토스트 메시지 추가
  document.body.appendChild(toast);

  // 3초 동안 유지 후 페이드 아웃
  const fadeOutTimer = setTimeout(() => {
    toast.style.opacity = "0";
  }, 3000);

  // 페이드 아웃 완료 후 제거
  toast.addEventListener("transitionend", () => {
    if (toast.style.opacity === "0") {
      document.body.removeChild(toast);
      clearTimeout(fadeOutTimer);
    }
  });
}

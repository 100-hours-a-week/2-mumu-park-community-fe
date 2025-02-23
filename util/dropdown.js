function dropdownSetting() {
  const dropdownItems = document.querySelectorAll(".dropdown-item");
  dropdownItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.stopPropagation();
      const text = e.target.textContent;
      switch (text) {
        case "회원정보수정":
          window.location.href = "../profile/edit-profile.html";
          break;
        case "비밀번호수정":
          window.location.href = "../profile/change-password.html";
          break;
        case "로그아웃":
          window.location.href = "../../sign/sign-in.html";
          break;
      }
    });
  });
}

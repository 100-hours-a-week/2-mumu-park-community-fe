function dropdownSetting() {
  const profileSection = document.querySelector(".profile-section");
  const profileDropdown = document.querySelector(".profile-dropdown");

  profileSection.addEventListener("click", function (event) {
    event.stopPropagation();
    profileDropdown.style.display =
      profileDropdown.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", function () {
    profileDropdown.style.display = "none";
  });

  const dropdownItems = document.querySelectorAll(".dropdown-item");
  dropdownItems.forEach((item) => {
    item.addEventListener("click", async function (e) {
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
          await logout();
          alert("로그아웃 되었습니다.");
          window.location.href = "../../sign/sign-in.html";
          break;
      }
    });
  });
}

async function logout() {
  try {
    const token = sessionStorage.getItem("accessToken");

    const response = await fetch(`http://127.0.0.1:8080/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Update Post failed:", error);
    throw error;
  }
}

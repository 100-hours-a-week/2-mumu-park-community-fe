function validateProfileImage() {
  const profileImage = document.getElementById("profile-imag").files[0];
  if (!profileImage) {
    return "* 프로필 사진을 추가해주세요.";
  }
  return "";
}

async function getUserInfo() {
  const token = sessionStorage.getItem("accessToken");

  try {
    const response = await fetch(`http://127.0.0.1:8080/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    return result.data;
  } catch (err) {
    alert("좋아요 여부 조회 실패");
  }
}

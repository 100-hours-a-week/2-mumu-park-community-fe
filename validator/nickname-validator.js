async function validateNickname(nickname) {
  if (isEmpty(nickname)) {
    return "* 닉네임을 입력해주세요.";
  }

  if (hasWhitespace(nickname)) {
    return "* 띄어쓰기를 없애주세요.";
  }

  if (isTooLong(nickname)) {
    return "* 닉네임은 최대 10자까지 작성 가능합니다.";
  }

  const isDuplicate = await isDuplicateNickname(nickname);
  if (isDuplicate) {
    return "* 중복된 닉네임입니다.";
  }

  return "";
}

function isEmpty(nickname) {
  return !nickname;
}

function hasWhitespace(nickname) {
  return nickname.includes(" ");
}

function isTooLong(nickname, maxLength = 10) {
  return nickname.length > maxLength;
}

async function isDuplicateNickname(nickname) {
  try {
    const response = await fetch("../data/member.json");

    if (!response.ok) {
      throw new Error("error creating");
    }

    const users = await response.json();
    return users.some((user) => user.nickname === nickname);
  } catch (err) {
    console.error("데이터를 가져오는 중 오류 발생:", err);
    alert("닉네임 중복체크에 실패하였습니다.");
    return false;
  }
}

async function checkNicknameDuplicate(nickname) {
  try {
    const response = await fetch(`/users/nickname?nickname=${nickname}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result.data?.isExist || false;
  } catch (error) {
    console.error("Nickname duplicate check failed:", error);
    return false;
  }
}

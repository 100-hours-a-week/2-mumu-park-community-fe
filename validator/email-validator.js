async function validateEmail(email) {
  if (isEmpty(email)) {
    return "* 이메일을 입력해주세요.";
  }

  if (!isValidEmailFormat(email)) {
    return "* 올바른 이메일 주소를 입력해주세요. (예: example@example.com)";
  }

  const isExistEmail = await isExist(email);
  if (isExistEmail) {
    return "* 중복된 이메일입니다.";
  }

  return "";
}

function isEmpty(email) {
  if (!email) {
    return true;
  }
  return false;
}

function isValidEmailFormat(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return false;
  }
  return true;
}

async function isExist(email) {
  try {
    const response = await fetch("../data/member.json");

    if (!response.ok) {
      throw new Error("error creating");
    }

    const users = await response.json();
    return users.some((user) => user.email === email);
  } catch (err) {
    console.error("데이터를 가져오는 중 오류 발생:", err);
    return false;
  }
}

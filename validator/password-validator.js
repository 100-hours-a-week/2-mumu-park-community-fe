function validatePassword(password) {
  if (!password) {
    return "* 비밀번호를 입력해주세요.";
  }

  if (!isValidPasswordLength(password) || !isValidPasswordFormat(password)) {
    return "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
  }

  return "";
}

function isValidPasswordLength(password) {
  if (password.length < 8 || password.length > 20) {
    return false;
  }
  return true;
}

function isValidPasswordFormat(password) {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
}

function validatePasswordConfirm(password, confirmPassword) {
  if (!confirmPassword) {
    return "* 비밀번호를 한번더 입력해주세요.";
  }

  if (password !== confirmPassword) {
    return "* 비밀번호가 다릅니다.";
  }

  return "";
}

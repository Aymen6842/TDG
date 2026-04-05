export function getServerErrorWarning(status: number, t: (key: string) => string) {
  if (status === 400) {
    return t("errors.invalidData");
  } else if (status === 404) {
    return t("errors.userNotFound");
  } else {
    return t("errors.unexpectedError");
  }
}

export function getPasswordChangementGeneralWarning(
  passwords: {
    currentPassword: string;
    newPassword: string;
    confirmationPassword: string;
  },
  t: (key: string) => string
) {
  if (
    passwords.currentPassword.length < 8 ||
    passwords.newPassword.length < 8 ||
    passwords.confirmationPassword.length < 8
  )
    return t("warnings.passwordMinLengthError");

  if (passwords.newPassword !== passwords.confirmationPassword)
    return t("warnings.passwordsDoNotMatchError");

  return "";
}

export function getNameChangementGeneralWarning(name: string, t: (key: string) => string) {
  if (name.length < 8) return t("warnings.warnings.nameMinLengthError");
  return "";
}

export function getGeneralWarning(
  warning: {
    email: string;
    name?: string;
    password: string;
  },
  t: (key: string) => string
) {
  const { email, name, password } = getAuthData();

  if (email === "" || name === "" || password === "") {
    return t("warnings.fillAllFields");
  } else if (warning.email && warning.password && warning.email !== "" && warning.password !== "") {
    return t("warnings.emailPasswordError");
  } else if (warning.email && warning.email !== "") {
    return t("warnings.emailError");
  } else if (warning.password && warning.password !== "") {
    return t("warnings.passwordError");
  } else {
    return "";
  }
}

function getAuthData() {
  const email = document.getElementById("email") as HTMLInputElement;
  const name = document.getElementById("name") as HTMLInputElement;
  const password = document.getElementById("password") as HTMLInputElement;

  const userData: { email?: string; password?: string; name?: string } = {};

  if (name) userData.name = name.value;
  if (email) userData.email = email.value;
  if (password) userData.password = password.value;

  return userData;
}

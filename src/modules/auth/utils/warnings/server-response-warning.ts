export function getSignInStatusWarning(
  status: number,
  t: (key: string) => string
) {
  if (status === 401) {
    return t("warnings.incorrectEmailOrPassword");
  } else if (status === 400) {
    return t("warnings.invalidData");
  } else if (status === 404) {
    return t("warnings.userNotFound");
  } else if (status === 409) {
    return t("warnings.accountCreatedWithFacebookOrGoogle");
  } else {
    return t("warnings.unexpectedError");
  }
}

export function getSignUpStatusWarning(
  status: number,
  t: (key: string) => string
) {
  if (status === 400) {
    return {
      generalWarning: t("warnings.emailAlreadyExist"),
      email: t("warnings.emailAlreadyExist"),
    };
  } else {
    return {
      generalWarning: t("warnings.unexpectedError"),
    };
  }
}

export function getEmailSubmitionStatusWarning(
  status: number,
  t: (key: string) => string
) {
  if (status === 400) {
    return t("warnings.featureNotAvailableForFacebookOrGoogle");
  } else if (status === 404) {
    return t("warnings.userNotFound");
  } else {
    return t("warnings.unexpectedError");
  }
}

export function getPasswordChangementWarning(
  status: number,
  code: string,
  t: (key: string) => string
) {
  if (status === 400) {
    if (code === "P2011") {
      return {
        generalWarning: t("warnings.featureNotAvailableForFacebookOrGoogle"),
        passwordWarning: "",
      };
    } else if (code === "P4000") {
      return {
        generalWarning: t("warnings.oldPasswordIncorrect"),
      };
    }
  } else if (status === 500) {
    if (code === "P1001") {
      return {
        generalWarning: t("warnings.serverError"),
      };
    }
  } else if (status === 404) {
    if (code === "P2001") {
      return {
        generalWarning: t("warnings.userNotFound"),
      };
    }
  } else {
    return {
      generalWarning: t("warnings.unexpectedError"),
      passwordWarning: "",
    };
  }
}

export function getEmailConfirmationWarning(
  status: number,
  t: (key: string) => string
) {
  if (status === 400) {
    return t("warnings.yourTokenHasExpired");
  } else if (status === 404) {
    return t("warnings.tokenIsInvalid");
  }

  return "";
}

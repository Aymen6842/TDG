import { UserSignInType, UserSignUpType } from "@/modules/auth/types";
import { SafeParseReturnType } from "zod";

export function getSignInWarnings(safeSchema: SafeParseReturnType<UserSignInType, UserSignInType>) {
  const warningResult: { [key: string]: string } = {};

  safeSchema.error?.errors.map((error) => {
    const errorKey = error.path[0] as string;
    warningResult[errorKey] = error.message;
  });

  return warningResult as {
    email: string;
    password: string;
  };
}

export function getSignUpWarnings(safeSchema: SafeParseReturnType<UserSignUpType, UserSignUpType>) {
  const warningResult: { [key: string]: string } = {};

  safeSchema.error?.errors.map((error) => {
    const errorKey = error.path[0] as string;
    warningResult[errorKey] = error.message;
  });

  return warningResult as {
    email: string;
    name: string;
    password: string;
  };
}

export function getPasswordsWarnings(
  safeSchema: SafeParseReturnType<
    { password: string; confirmationPassword: string },
    { password: string; confirmationPassword: string }
  >
) {
  const warningResult: { [key: string]: string } = {};

  safeSchema.error?.errors.map((error) => {
    error.path.forEach((errorKey) => {
      warningResult[errorKey] = error.message;
    });
  });

  return warningResult as {
    password: string;
    confirmationPassword: string;
    generalWarning: string;
  };
}

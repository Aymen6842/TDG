import { SafeParseReturnType } from "zod";

export function getPasswordChangementWarnings(
  safeSchema: SafeParseReturnType<
    {
      currentPassword: string;
      newPassword: string;
      confirmationPassword: string;
    },
    {
      currentPassword: string;
      newPassword: string;
      confirmationPassword: string;
    }
  >
) {
  const warningResult: { [key: string]: string } = {};

  safeSchema.error?.errors.map((error) => {
    error.path.forEach((errorKey) => {
      warningResult[errorKey] = error.message;
    });
  });

  return warningResult as {
    currentPassword: string;
    newPassword: string;
    confirmationPassword: string;
  };
}

export function getNameChangementWarnings(
  safeSchema: SafeParseReturnType<{ newName: string }, { newName: string }>
) {
  const warningResult: { [key: string]: string } = {};

  safeSchema.error?.errors.forEach((error) => {
    error.path.forEach((errorKey) => {
      warningResult[errorKey] = error.message;
    });
  });

  return warningResult as { newName: string };
}

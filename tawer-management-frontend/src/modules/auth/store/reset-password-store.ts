import { create } from "zustand";
import { getServerErrorWarning } from "../utils/warnings/general-warning";
import { getEmailSchema } from "../validation/schemas/auth/email";
import { resetPassword } from "../services/reset-password/password-submition";
import { sendResetPasswordEmail } from "../services/reset-password/email-submition";
import { verifyResetPasswordCode } from "../services/reset-password/code-verification";
import { getPasswordConfirmationSchema } from "../validation/schemas/auth/password-confirmation";

interface ResetPasswordState {
  step: "email" | "code" | "password";
  email: string;
  code: string;
  password: string;
  confirmationPassword: string;
  warning: { email: string; generalWarning: string };
  passwordWarning: {
    password: string;
    confirmationPassword: string;
    generalWarning: string;
  };
  displayedTimer: string;
  startPasswordStep: boolean;
  isLoading: boolean;
  timerId: NodeJS.Timeout | null;
  timeLeft: number;
}

interface ResetPasswordActions {
  setStep: (step: "email" | "code" | "password") => void;
  setEmail: (email: string) => void;
  setCode: (code: string) => void;
  setPassword: (password: string) => void;
  setConfirmationPassword: (confirmationPassword: string) => void;
  submitEmail: (t: (key: string) => string) => Promise<void>;
  submitCode: (t: (key: string) => string) => Promise<void>;
  submitPassword: (t: (key: string) => string) => Promise<boolean>;
  startTimer: () => void;
  resetTimer: () => void;
}

type ResetPasswordStore = ResetPasswordState & ResetPasswordActions;

const initialState: ResetPasswordState = {
  step: "email",
  email: "",
  code: "",
  password: "",
  confirmationPassword: "",
  warning: { email: "", generalWarning: "" },
  passwordWarning: {
    password: "",
    confirmationPassword: "",
    generalWarning: ""
  },
  displayedTimer: "05:00",
  startPasswordStep: false,
  isLoading: false,
  timerId: null,
  timeLeft: 300
};

export const useResetPasswordStore = create<ResetPasswordStore>((set, get) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setEmail: (email) => set({ email }),
  setCode: (code) => set({ code }),
  setPassword: (password) => set({ password }),
  setConfirmationPassword: (confirmationPassword) => set({ confirmationPassword }),
  submitEmail: async (t) => {
    const { email } = get();
    const emailSchema = getEmailSchema(t);
    const verificationResult = emailSchema.safeParse({ email });

    if (!verificationResult.success) {
      set({
        warning: {
          email: verificationResult.error.errors[0].message,
          generalWarning: verificationResult.error.errors[0].message
        }
      });
      return;
    }

    set({ isLoading: true });

    try {
      const res = await sendResetPasswordEmail(email);
      if (!res.ok) {
        set({
          warning: {
            email: "",
            generalWarning: getServerErrorWarning(res.status, t)
          }
        });
      } else {
        set({
          step: "code",
          warning: { email: "", generalWarning: "" }
        });
        get().startTimer();
      }
    } finally {
      set({ isLoading: false });
    }
  },
  submitCode: async (t) => {
    const { email, code } = get();
    set({ isLoading: true });

    try {
      const res = await verifyResetPasswordCode({ email, code });
      if (res.ok) {
        set({ step: "password" });
        setTimeout(() => set({ startPasswordStep: true }), 500);
      } else {
        set({
          warning: {
            email: "",
            generalWarning: t("invalidCode")
          }
        });
      }
    } catch (error) {
      set({
        warning: {
          email: "",
          generalWarning: ""
        }
      });
    } finally {
      set({ isLoading: false });
    }
  },
  submitPassword: async (t) => {
    const { email, code, password, confirmationPassword } = get();
    const passwordSchema = getPasswordConfirmationSchema(t);
    const validationResult = passwordSchema.safeParse({ password, confirmationPassword });
    console.log(validationResult.error?.errors);
    if (!validationResult.success) {
      const passwordWarning = {
        password: "",
        confirmationPassword: "",
        generalWarning: ""
      };

      validationResult.error.errors.forEach((error) => {
        if (error.path.includes("password")) {
          passwordWarning.password = error.message;
        } else if (error.path.includes("confirmationPassword")) {
          passwordWarning.confirmationPassword = error.message;
        } else if (error.path.includes("generalWarning")) {
          passwordWarning.generalWarning = error.message;
        }
      });
      console.log(passwordWarning);

      set({ passwordWarning });
      return false;
    }

    set({ isLoading: true });

    try {
      const res = await resetPassword({
        email,
        code,
        password
      });

      if (res.ok) {
        return true;
      } else {
        set({
          passwordWarning: {
            password: "",
            confirmationPassword: "",
            generalWarning: getServerErrorWarning(res.status, t)
          }
        });
        return false;
      }
    } finally {
      set({ isLoading: false });
    }
  },
  startTimer: () => {
    const { timerId, timeLeft } = get();
    if (timerId) clearInterval(timerId);

    let currentTime = timeLeft;
    const newTimerId = setInterval(() => {
      currentTime -= 1;
      const min = Math.floor(currentTime / 60);
      const seconds = currentTime % 60;
      const displayedTimer = `${min.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      set({ displayedTimer, timeLeft: currentTime });

      if (currentTime <= 0) {
        clearInterval(newTimerId);
        set({ timerId: null });
      }
    }, 1000);

    set({ timerId: newTimerId });
  },
  resetTimer: () => {
    const { timerId } = get();
    if (timerId) clearInterval(timerId);
    set({ displayedTimer: "05:00", timeLeft: 300, timerId: null });
  }
}));

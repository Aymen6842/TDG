import { TranslateFunction } from "@/types";
import { z } from "zod";

function buildNameChangeSchema(t?: TranslateFunction) {
  return z.object({
    newName: z
      .string()
      .min(2, t ? t("nameChangement.minLength") : "Name must be at least 2 characters long")
      .max(50, t ? t("nameChangement.maxLength") : "Name must be at most 50 characters long")
      .regex(
        /^[a-zA-Z\s'-]+$/,
        t ? t("nameChangement.invalidChars") : "Invalid characters in name"
      ),
  });
}

export function getNameChangementSchema(t?: TranslateFunction) {
  return buildNameChangeSchema(t);
}

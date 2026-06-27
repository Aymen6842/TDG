import { z } from "zod";

/**
 * Zod validation schema for user creation form
 * Validates fullName, email, password, and role fields
 */
interface Params {
  t: (key: string) => string;
}

export const getTeamFormSchema = ({ t }: Params) =>
  z
    .object({
      name: z.string().min(1, t("name.required")),

      members: z.array(z.string()).min(1, {
        message: t("members.required")
      }),
      manager: z.string().min(1, {
        message: t("managers.required")
      })
    })
    .superRefine(({ members, manager }, ctx) => {
      const duplicatedUser = members.includes(manager);

      if (duplicatedUser) {
        ctx.addIssue({
          path: ["members"],
          code: z.ZodIssueCode.custom,
          message: t("members.cannotContainManagers")
        });

        ctx.addIssue({
          path: ["managers"],
          code: z.ZodIssueCode.custom,
          message: t("managers.cannotBeMembers")
        });
      }
    });

export type TeamFormSchema = z.infer<ReturnType<typeof getTeamFormSchema>>;

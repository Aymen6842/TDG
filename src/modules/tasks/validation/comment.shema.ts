import { z } from "zod";

interface Params {
  t: (key: string) => string;
}

export const getCommentFormSchema = ({ t }: Params) =>
  z.object({
    taskId: z.string().optional(),
    comment: z.string().min(1, t("comment.required")),
  })


export type CommentFormSchema = z.infer<ReturnType<typeof getCommentFormSchema>>;

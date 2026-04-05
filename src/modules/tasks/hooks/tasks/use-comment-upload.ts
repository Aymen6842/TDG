import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CustomError } from "@/utils/custom-error";
import { CommentFormSchema, getCommentFormSchema } from "../../validation/comment.shema";
import uploadCommentOnServerSide from "../../services/comment/comment";
import { CommentType } from "../../types/comment";
import { useForm } from "react-hook-form";

interface Params {
  comment?: CommentType;
  taskId: string;
}

export default function useCommentUpload({ comment, taskId }: Params) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const t = useTranslations("modules.projects.tasks");
  const tValidations = useTranslations("modules.projects.tasks.validations");
  const tErrors = useTranslations("modules.projects.tasks.errors");

  const schema = getCommentFormSchema({ t: tValidations });

  const formComment = useForm<CommentFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      comment: comment?.comment ?? "",
    }
  });

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmitComment(data: CommentFormSchema) {
    setIsPending(true);
    if (error) setError("");

    try {
      await uploadCommentOnServerSide({
        comment: { ...data, taskId }
      });

      toast.success(t("success.commentCreated"));
      formComment.reset();
      queryClient.invalidateQueries({ queryKey: ["personal-tasks", "personal-task"], exact: false });

    } catch (thrownError) {
      const err = thrownError as CustomError;

      if (err.status === 401) {
        router.push("/dashboard/login");
        return;
      }

      if (err.status === 400) {
        toast.error(tErrors("invalidFormat"));
        setError(tErrors("invalidFormat"));
        return;
      }

      if (err.status === 500) {
        toast.error(tErrors("serverError"));
        setError(tErrors("serverError"));
        return;
      }

      toast.error(tErrors("taskUploadFailed"));
    } finally {
      setIsPending(false);
    }
  }

  return {
    formComment,
    error,
    isPending,
    onSubmitComment
  };
}

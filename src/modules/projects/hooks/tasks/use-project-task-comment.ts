import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { addProjectTaskComment, deleteProjectTaskComment } from "../../services";

const commentSchema = z.object({
  comment: z.string().min(1, "Comment is required")
});

type CommentFormSchema = z.infer<typeof commentSchema>;

interface Params {
  projectId: string;
  taskId: string;
}

export default function useProjectTaskComment({ projectId, taskId }: Params) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<CommentFormSchema>({
    resolver: zodResolver(commentSchema),
    defaultValues: { comment: "" }
  });

  async function onSubmit(data: CommentFormSchema) {
    setIsPending(true);
    try {
      await addProjectTaskComment(projectId, taskId, data.comment);
      toast.success("Comment added");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setIsPending(false);
    }
  }

  async function deleteComment(commentId: string) {
    try {
      await deleteProjectTaskComment(projectId, taskId, commentId);
      toast.success("Comment deleted");
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
    } catch {
      toast.error("Failed to delete comment");
    }
  }

  return { form, onSubmit, isPending, deleteComment };
}

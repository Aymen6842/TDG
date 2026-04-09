import { format } from "date-fns";
import { ClockIcon, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { ProjectTaskComment } from "../../../types/project-tasks";
import useProjectTaskComment from "../../../hooks/tasks/use-project-task-comment";

interface TaskCommentsSectionProps {
  projectId: string;
  taskId: string;
  comments: ProjectTaskComment[] | undefined;
}

export function TaskCommentsSection({ projectId, taskId, comments }: TaskCommentsSectionProps) {
  const tCommon = useTranslations("modules.projects.tasks");
  const { form, onSubmit, isPending, deleteComment } = useProjectTaskComment({ projectId, taskId });

  return (
    <div className="p-4">
      {comments && comments.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Comments ({comments.length})</h4>
          <div className="space-y-2">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-muted group relative space-y-3 rounded-md p-3">
                <p className="text-sm">{comment.comment}</p>
                <div className="text-muted-foreground flex justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="size-3" />
                    {format(new Date(comment.createdAt), "MMM d, yyyy - h:mm a")}
                  </div>
                  <div className="absolute end-2 bottom-2 flex items-center opacity-0 group-hover:opacity-100">
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteComment(comment.id)}>
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-muted text-muted-foreground rounded-md p-4 text-center text-sm mb-4">No comments yet</div>
      )}

      <div className="space-y-3 mt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField control={form.control} name="comment" render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea {...field} placeholder={tCommon("upload.form.placeholders.comment")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex-1 flex justify-end">
              <Button type="submit" disabled={isPending}>{tCommon("actions.createComment")}</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

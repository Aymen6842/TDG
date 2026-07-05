"use client";
import React from "react";
import { format } from "date-fns";
import { ClockIcon, Edit2, Heart, Trash2, X, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { ProjectTaskComment } from "../../../types/project-tasks";
import useProjectTaskComment from "../../../hooks/tasks/use-project-task-comment";
import {
  editProjectTaskComment,
  likeProjectTaskComment,
} from "@/modules/projects/services/api/project-task-comments-enhanced";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface TaskCommentsSectionProps {
  projectId: string;
  taskId: string;
  comments: ProjectTaskComment[] | undefined;
}

export function TaskCommentsSection({ projectId, taskId, comments }: TaskCommentsSectionProps) {
  const tCommon = useTranslations("modules.projects.tasks");
  const { form, onSubmit, isPending, deleteComment } = useProjectTaskComment({ projectId, taskId });
  const queryClient = useQueryClient();

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editText, setEditText] = React.useState("");
  const [likingId, setLikingId] = React.useState<string | null>(null);

  async function handleSaveEdit(commentId: string) {
    try {
      await editProjectTaskComment(projectId, taskId, commentId, editText);
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      toast.success(tCommon("commentUpdatedToast"));
      setEditingId(null);
    } catch (err: any) {
      toast.error(err?.message || tCommon("commentUpdateFailedToast"));
    }
  }

  async function handleLike(commentId: string) {
    setLikingId(commentId);
    try {
      await likeProjectTaskComment(projectId, taskId, commentId);
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
    } catch (err: any) {
      toast.error(err?.message || tCommon("likeToggleFailedToast"));
    } finally {
      setLikingId(null);
    }
  }

  return (
    <div className="p-4">
      {comments && comments.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">
            {tCommon("upload.form.labels.comments")} ({comments.length})
          </h4>
          <div className="space-y-2">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-muted group relative space-y-3 rounded-md p-3">
                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="text-sm min-h-[60px]"
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="size-3" />
                      </Button>
                      <Button size="sm" onClick={() => handleSaveEdit(comment.id)}>
                        <Check className="size-3 mr-1" /> {tCommon("saveButton")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm">{comment.content}</p>
                )}

                <div className="text-muted-foreground flex justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="size-3" />
                    {format(new Date(comment.createdAt), "MMM d, yyyy - h:mm a")}
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Like button */}
                    <button
                      onClick={() => handleLike(comment.id)}
                      disabled={likingId === comment.id}
                      className={`flex items-center gap-1 transition-colors ${
                        comment.likedByMe
                          ? "text-rose-500"
                          : "text-muted-foreground hover:text-rose-400"
                      }`}
                    >
                      <Heart
                        className="size-3"
                        fill={comment.likedByMe ? "currentColor" : "none"}
                      />
                      {(comment.likeCount ?? 0) > 0 && (
                        <span>{comment.likeCount}</span>
                      )}
                    </button>
                    {/* Edit button */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-6 p-0"
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditText(comment.content);
                        }}
                      >
                        <Edit2 className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-6 p-0 text-destructive"
                        onClick={() => deleteComment(comment.id)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-muted text-muted-foreground rounded-md p-4 text-center text-sm mb-4">
          {tCommon("upload.form.labels.noComments")}
        </div>
      )}

      <div className="space-y-3 mt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={tCommon("upload.form.placeholders.comment")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex-1 flex justify-end">
              <Button type="submit" disabled={isPending}>
                {tCommon("actions.createComment")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

import React from "react";
import { Check, PlusCircleIcon, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { ProjectTaskType } from "../../../types/project-tasks";
import useProjectTaskUpload from "../../../hooks/tasks/use-project-task-upload";
import { deleteProjectTask } from "@/modules/projects/services";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface TaskSubtasksSectionProps {
  projectId: string;
  task: ProjectTaskType;
}

export function TaskSubtasksSection({ projectId, task }: TaskSubtasksSectionProps) {
  const tCommon = useTranslations("modules.projects.tasks");
  const queryClient = useQueryClient();
  const [isAddingSubTask, setIsAddingSubTask] = React.useState(false);
  const [subTaskToDelete, setSubTaskToDelete] = React.useState<string | null>(null);
  const [isDeletingSubTask, setIsDeletingSubTask] = React.useState(false);

  const { form, onSubmit } = useProjectTaskUpload({
    projectId,
    onSuccess: () => { form.reset(); setIsAddingSubTask(false); },
  });

  const handleDeleteSubTask = async () => {
    if (!subTaskToDelete) return;
    setIsDeletingSubTask(true);
    try {
      await deleteProjectTask(projectId, subTaskToDelete);
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      toast.success("Subtask deleted");
      setSubTaskToDelete(null);
    } catch {
      toast.error("Failed to delete subtask");
    } finally {
      setIsDeletingSubTask(false);
    }
  };

  const onAddSubTask = () => {
    form.setValue("parentTaskId" as any, task.id);
    setIsAddingSubTask(true);
  };

  return (
    <div className="space-y-4 p-4">
      <h4 className="text-sm font-medium">Subtasks</h4>
      {task.subTasks && task.subTasks.length > 0 ? (
        <div className="space-y-2">
          {task.subTasks.map((subTask) => (
            <div key={subTask.id} className="bg-muted flex items-center justify-between rounded-md p-2">
              <span>{subTask.title}</span>
              <Button variant="ghost" className="text-destructive" size="sm" onClick={() => setSubTaskToDelete(subTask.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-muted text-muted-foreground rounded-md p-4 text-center text-sm">No subtasks yet</div>
      )}

      {!isAddingSubTask && (
        <div className="flex-1 flex justify-end mt-2">
          <Button variant="outline" size="sm" onClick={onAddSubTask}>
            <PlusCircleIcon className="mr-1 size-4" />
            <span>Create Subtask</span>
          </Button>
        </div>
      )}

      {isAddingSubTask && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 items-end mt-2">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input {...field} placeholder={tCommon("enterSubTaskTitle")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit"><Check className="size-4" /></Button>
            <Button type="button" variant="destructive" onClick={() => { setIsAddingSubTask(false); form.reset(); }}>
              <X className="size-4" />
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}

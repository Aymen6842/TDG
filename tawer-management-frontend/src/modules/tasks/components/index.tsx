"use client";
import React from "react";
import { useTodoStore } from "@/modules/tasks/store/tasks";
import TasksList from "@/modules/tasks/components/tasks-list";
import TaskDetailSheet from "@/modules/tasks/components/task-details-sheet";
import { useTranslations } from "next-intl";
import TaskUploadForm from "../uploads/task-upload";
import { TaskType } from "../types/tasks";

export default function PersonalTasks() {
  const { activeTab, isAddDialogOpen, setAddDialogOpen, isTodoSheetOpen, setTodoSheetOpen } = useTodoStore();

  const [selectedId, setSelectedId] = React.useState("");
  const [editTask, setEditTask] = React.useState<TaskType | null>(null);

  const t = useTranslations("modules.tasks");

  return (
    <div className="space-y-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">{t("tabs.personal")}</h1>
      </header>
      <TasksList
        activeTab={activeTab}
        onSelectTask={(id) => { setSelectedId(id); setTodoSheetOpen(true); }}
        onAddTodoClick={() => { setEditTask(null); setAddDialogOpen(true); }}
      />

      <TaskUploadForm
        isOpen={isAddDialogOpen}
        onClose={() => { setAddDialogOpen(false); setEditTask(null); }}
        task={editTask as TaskType}
      />

      <TaskDetailSheet
        isOpen={isTodoSheetOpen}
        onClose={() => setTodoSheetOpen(false)}
        taskId={selectedId}
        onEditClick={(task) => { setTodoSheetOpen(false); setEditTask(task); setAddDialogOpen(true); }}
      />
    </div>
  );
}

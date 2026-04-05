"use client";;
import React from "react";
import { useTodoStore } from "@/modules/tasks/store/tasks";

import TasksList from "@/modules/tasks/tasks-list";
import TaskDetailSheet from "@/modules/tasks/task-details-sheet";
import { useTranslations } from "next-intl";
import TaskUploadForm from "./uploads/task-upload";
import { TaskType } from "./types/tasks";

export default function Tasks() {
  const {
    activeTab,
    isAddDialogOpen,
    setAddDialogOpen,
    isTodoSheetOpen,
    setTodoSheetOpen,
    setSelectedTodoId
  } = useTodoStore();

  // Add state for managing edit mode
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [editTask, setEditTask] = React.useState<TaskType | null>(null);

  const handleAddTodoClick = () => {
    // Clear edit ID when adding a new todo
    setEditTask(null);
    setAddDialogOpen(true);
  };

  const handleEditTodoClick = (task: TaskType) => {
    // Set the edit ID and open the add/edit sheet
    setEditTask(task);
    setAddDialogOpen(true);
  };

  const handleSelectTask = (id: string) => {
    setSelectedId(id);
    setTodoSheetOpen(true);
  };

  const handleCloseAddSheet = () => {
    setAddDialogOpen(false);
    setEditTask(null);
  };

  const handleCloseTodoSheet = () => {
    setTodoSheetOpen(false);
    setSelectedTodoId(null);
  };

  const t = useTranslations("modules.projects.tasks");

  return (
    <div className="space-y-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      </header>

      <TasksList
        activeTab={activeTab}
        onSelectTask={handleSelectTask}
        onAddTodoClick={handleAddTodoClick}
      />

      <TaskUploadForm
        isOpen={isAddDialogOpen}
        onClose={handleCloseAddSheet}
        task={editTask as TaskType}
      />

      <TaskDetailSheet
        isOpen={isTodoSheetOpen}
        onClose={handleCloseTodoSheet}
        taskId={selectedId}
        onEditClick={(selectedId) => {
          handleCloseTodoSheet();
          handleEditTodoClick(selectedId);
        }}
      />
    </div>
  );
}

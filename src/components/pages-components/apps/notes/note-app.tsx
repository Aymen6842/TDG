"use client";

import NoteContent from "./note-content";
import NoteSidebar from "./note-sidebar";


export default function NotesApp() {
  return (
    <div className="flex items-start lg:space-x-4">
      <NoteSidebar />
      <NoteContent />
    </div>
  );
}

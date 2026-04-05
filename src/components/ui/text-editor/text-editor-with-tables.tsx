"use client";
import { EditorContent } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import TiptapToolbarWithTables from "./tiptap-toolbar-with-tables";
import useTextEditorWithTables from "@/hooks/use-text-editor-with-tables";
import { useEffect } from "react";

interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
  setContentIsEmpty?: (isEmpty: boolean) => void;
  placeholder?: string;
  className?: string;
  name?: string;
  disabled?: boolean;
}

export default function TextEditorWithTables({
  initialContent = "",
  onChange,
  placeholder = "...",
  className,
  name,
  setContentIsEmpty,
  disabled = false,
}: RichTextEditorProps) {
  const { editor, content } = useTextEditorWithTables(initialContent, onChange);

  useEffect(() => {
    if (setContentIsEmpty && editor) {
      if (editor.getText().trim() === "") setContentIsEmpty(true);
      else setContentIsEmpty(false);
    }
  }, [content]);

  return (
    editor && (
      <div className={cn("border rounded-lg overflow-hidden", className)}>
        <TiptapToolbarWithTables editor={editor} />
        <EditorContent
          editor={editor}
          placeholder={placeholder}
          onClick={() => editor?.commands.focus()}
          disabled={disabled}
          className="p-3 min-h-[200px] border prose prose-sm max-w-none [&_table]:border-collapse [&_table]:border [&_table]:border-gray-300 [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_th]:bg-gray-50 [&_th]:font-semibold"
        />
        <Input
          id="description"
          value={content}
          readOnly
          className="hidden"
          name={name}
        />
      </div>
    )
  );
}

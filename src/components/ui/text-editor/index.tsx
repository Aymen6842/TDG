"use client";;
import { EditorContent } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import TiptapToolbar from "./tiptap-toolbar";
import useTextEditor from "@/hooks/use-text-editor";
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

export default function TextEditor({
  initialContent = "",
  onChange,
  placeholder = "...",
  className,
  name,
  setContentIsEmpty,
  disabled = false
}: RichTextEditorProps) {
  const { editor, content } = useTextEditor(initialContent, onChange);

  useEffect(() => {
    if (setContentIsEmpty && editor) {
      if (editor.getText().trim() === "") setContentIsEmpty(true);
      else setContentIsEmpty(false);
    }
  }, [content]);

  return (
    editor && (
      <div className={cn("overflow-hidden rounded-lg border", className)}>
        <TiptapToolbar editor={editor} />
        <Input id="description" value={content} readOnly className="hidden" name={name} />
        <EditorContent
          editor={editor}
          placeholder={placeholder}
          onClick={() => editor?.commands.focus()}
          disabled={disabled}
          className="prose prose-sm min-h-[200px] max-w-none border p-3"
        />
      </div>
    )
  );
}

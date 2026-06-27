import { useEffect, useState } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import Text from "@tiptap/extension-text";
import TextStyle from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import { logger } from "@/lib/logger";

export default function useTextEditor(initialContent: string, onChange?: (html: string) => void) {
  const [content, setContent] = useState(initialContent);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      BulletList,
      OrderedList,
      ListItem,
      TextAlign.configure({
        types: ["heading", "paragraph"] // Enable alignment for these elements
      }),
      Underline,
      Superscript,
      Subscript,
      Highlight.configure({
        multicolor: true
      }),
      Color,
      Text,
      TextStyle,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
          class: "custom-link"
        }
      })
    ],
    content: initialContent || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      onChange?.(html);
    }
  });

  useEffect(() => {
    setContent(initialContent);
    logger.log("is chaning")
    if (editor)
      editor.commands.setContent(initialContent)
  }, [initialContent])

  return { editor, content };
}

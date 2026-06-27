import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Code,
  Heading1,
  List,
  ListOrdered,
  Undo,
  Redo,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Heading2,
  Highlighter,
  UnderlineIcon,
  Strikethrough,
  X,
  Quote,
  SubscriptIcon,
  SuperscriptIcon,
  Heading3,
} from "lucide-react";
import TiptapActionButton from "./tiptap-action-button";
import ColorPicker from "./color-picker";
import { useEffect, useState } from "react";
import { TiptapLinkInsert } from "./actions/tiptap-link-insert";
import { TiptapUnlink } from "./actions/tiptap-unlink";
import { TiptapTableInsert } from "./actions/tiptap-table-insert";
import { TiptapTableActions } from "./actions/tiptap-table-actions";

interface Props {
  editor: Editor;
}

export default function TiptapToolbarWithTables({ editor }: Props) {
  const iconSize = "sm";
  const iconStyle = `h-4 w-4`;
  const [color, setColor] = useState("");
  const [colorPickerIsOpen, setColorPickerIsOpen] = useState(false);
  const { color: editorColor }: { color?: string } =
    editor.getAttributes("textStyle");

  const actions = [
    {
      icon: <Bold size={iconSize} className={iconStyle} />,
      pressed: editor.isActive("bold"),
      onPressedChange: () => editor.chain().focus().toggleBold().run(),
      ariaLabel: "Bold",
    },
    {
      icon: <Italic size={iconSize} className={iconStyle} />,
      pressed: editor.isActive("italic"),
      onPressedChange: () => editor.chain().focus().toggleItalic().run(),
      ariaLabel: "Italic",
    },
    {
      icon: <Code size={iconSize} className={iconStyle} />,
      pressed: editor.isActive("code"),
      onPressedChange: () => editor.chain().focus().toggleCode().run(),
      ariaLabel: "Code",
    },
    {
      icon: <Strikethrough size={iconSize} className={iconStyle} />,
      pressed: editor.isActive("strike"),
      onPressedChange: () => editor.chain().focus().toggleStrike().run(),
      ariaLabel: "Strikethrough",
    },
    {
      icon: <UnderlineIcon size={iconSize} className={iconStyle} />,
      pressed: editor.isActive("underline"),
      onPressedChange: () => editor.chain().focus().toggleUnderline().run(),
      ariaLabel: "Underline",
    },
    {
      icon: <Highlighter size={iconSize} className={iconStyle} />,
      pressed: editor.isActive("highlight"),
      onPressedChange: () => editor.chain().focus().toggleHighlight().run(),
      ariaLabel: "Highlight",
    },
    {
      icon: <SuperscriptIcon size={iconSize} className={iconStyle} />,
      pressed: editor.isActive("superscript"),
      onPressedChange: () => editor.chain().focus().toggleSuperscript().run(),
      ariaLabel: "Superscript",
    },
    {
      icon: <SubscriptIcon size={iconSize} className={iconStyle} />,
      pressed: editor.isActive("subscript"),
      onPressedChange: () => editor.chain().focus().toggleSubscript().run(),
      ariaLabel: "Subscript",
    },
    {
      icon: <Heading1 size={iconSize} className={iconStyle} />,
      pressed: editor.isActive("heading", { level: 1 }),
      onPressedChange: () =>
        editor.chain().focus().toggleHeading({ level: 1 }).run(),
      ariaLabel: "Heading 1",
    },
    {
      icon: <Heading2 size={iconSize} className={iconStyle} />,
      pressed: editor.isActive("heading", { level: 2 }),
      onPressedChange: () =>
        editor.chain().focus().toggleHeading({ level: 2 }).run(),
      ariaLabel: "Heading 2",
    },
    {
      icon: <Heading3 size={iconSize} className={iconStyle} />,
      pressed: editor.isActive("heading", { level: 3 }),
      onPressedChange: () =>
        editor.chain().focus().toggleHeading({ level: 3 }).run(),
      ariaLabel: "Heading 3",
    },
    {
      icon: <List size={iconSize} className={iconStyle} />,
      pressed: editor.isActive("bulletList"),
      onPressedChange: () => editor.chain().focus().toggleBulletList().run(),
      ariaLabel: "Bullet List",
    },
    {
      icon: <ListOrdered size={iconSize} className={iconStyle} />,
      pressed: editor.isActive("orderedList"),
      onPressedChange: () => editor.chain().focus().toggleOrderedList().run(),
      ariaLabel: "Ordered List",
    },
    {
      icon: <Quote size={iconSize} className={iconStyle} />,
      pressed: editor.isActive("blockquote"),
      onPressedChange: () => editor.chain().focus().toggleBlockquote().run(),
      ariaLabel: "Blockquote",
    },
    {
      icon: <AlignLeft size={iconSize} className={iconStyle} />,
      pressed: editor.isActive({ textAlign: "left" }),
      onPressedChange: () => editor.chain().focus().setTextAlign("left").run(),
      ariaLabel: "Align Left",
    },
    {
      icon: <AlignCenter size={iconSize} className={iconStyle} />,
      pressed: editor.isActive({ textAlign: "center" }),
      onPressedChange: () =>
        editor.chain().focus().setTextAlign("center").run(),
      ariaLabel: "Align Center",
    },
    {
      icon: <AlignRight size={iconSize} className={iconStyle} />,
      pressed: editor.isActive({ textAlign: "right" }),
      onPressedChange: () => editor.chain().focus().setTextAlign("right").run(),
      ariaLabel: "Align Right",
    },
    {
      icon: <X size={iconSize} className={iconStyle} />,
      onPressedChange: () =>
        editor.chain().focus().clearNodes().unsetAllMarks().run(),
      ariaLabel: "Clear Formatting",
    },
    {
      icon: <Undo size={iconSize} className={iconStyle} />,
      onPressedChange: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().undo(),
      ariaLabel: "Undo",
    },
    {
      icon: <Redo size={iconSize} className={iconStyle} />,
      onPressedChange: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().redo(),
      ariaLabel: "Redo",
    },
  ];

  useEffect(() => {
    editor.commands.setColor(color);
  }, [color, editor]);

  useEffect(() => {
    if (editorColor && editorColor !== color) setColor(editorColor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorColor]);

  return (
    <div className="bg-muted/40 rounded-md p-1 flex flex-wrap items-center gap-0.5">
      {actions.slice(0, 8).map((action, index) => (
        <TiptapActionButton
          key={index}
          icon={action.icon}
          pressed={action.pressed}
          onPressedChange={action.onPressedChange}
          ariaLabel={action.ariaLabel}
        />
      ))}
      <ColorPicker
        color={color}
        setColor={setColor}
        isOpen={colorPickerIsOpen}
        setIsOpen={setColorPickerIsOpen}
        iconSize={iconSize}
        iconStyle={iconStyle}
      />
      {actions.slice(8).map((action, index) => (
        <TiptapActionButton
          key={index}
          icon={action.icon}
          pressed={action.pressed}
          onPressedChange={action.onPressedChange}
          ariaLabel={action.ariaLabel}
        />
      ))}
      <TiptapLinkInsert editor={editor} />
      <TiptapUnlink editor={editor} />
      <TiptapTableInsert
        editor={editor}
        iconSize={iconSize}
        iconStyle={iconStyle}
      />
      <TiptapTableActions
        editor={editor}
        iconSize={iconSize}
        iconStyle={iconStyle}
      />
    </div>
  );
}

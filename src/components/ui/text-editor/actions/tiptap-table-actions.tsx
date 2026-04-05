import { Editor } from "@tiptap/react";
import { Plus, Minus, Trash2 } from "lucide-react";
import TiptapActionButton from "../tiptap-action-button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";

interface Props {
  editor: Editor;
  iconSize?: string;
  iconStyle?: string;
}

export function TiptapTableActions({ editor, iconSize = "sm", iconStyle = "h-4 w-4" }: Props) {
  const t = useTranslations("shared.forms.upload.tableTooltips");
  const isInTable = editor.isActive("table");

  if (!isInTable) return null;

  return (
    <TooltipProvider>
      {/* Add Row */}
      <Tooltip>
        <TooltipTrigger asChild>
          <TiptapActionButton
            icon={<Plus size={iconSize} className={iconStyle} />}
            onPressedChange={() => editor.chain().focus().addRowAfter().run()}
            ariaLabel="Add Row"
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("addRowBelow")}</p>
        </TooltipContent>
      </Tooltip>

      {/* Add Column */}
      <Tooltip>
        <TooltipTrigger asChild>
          <TiptapActionButton
            icon={<Plus size={iconSize} className={`${iconStyle} rotate-90`} />}
            onPressedChange={() => editor.chain().focus().addColumnAfter().run()}
            ariaLabel="Add Column"
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("addColumnRight")}</p>
        </TooltipContent>
      </Tooltip>

      {/* Delete Row */}
      <Tooltip>
        <TooltipTrigger asChild>
          <TiptapActionButton
            icon={<Minus size={iconSize} className={iconStyle} />}
            onPressedChange={() => editor.chain().focus().deleteRow().run()}
            ariaLabel="Delete Row"
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("deleteCurrentRow")}</p>
        </TooltipContent>
      </Tooltip>

      {/* Delete Column */}
      <Tooltip>
        <TooltipTrigger asChild>
          <TiptapActionButton
            icon={<Minus size={iconSize} className={`${iconStyle} rotate-90`} />}
            onPressedChange={() => editor.chain().focus().deleteColumn().run()}
            ariaLabel="Delete Column"
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("deleteCurrentColumn")}</p>
        </TooltipContent>
      </Tooltip>

      {/* Delete Table */}
      <Tooltip>
        <TooltipTrigger asChild>
          <TiptapActionButton
            icon={<Trash2 size={iconSize} className={iconStyle} />}
            onPressedChange={() => editor.chain().focus().deleteTable().run()}
            ariaLabel="Delete Table"
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("deleteEntireTable")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

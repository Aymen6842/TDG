import { Editor } from "@tiptap/react";
import { Table } from "lucide-react";
import TiptapActionButton from "../tiptap-action-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";

interface Props {
  editor: Editor;
  iconSize?: string;
  iconStyle?: string;
}

export function TiptapTableInsert({
  editor,
  iconSize = "sm",
  iconStyle = "h-4 w-4",
}: Props) {
  const t = useTranslations("shared.forms.upload.tableTooltips");

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <TiptapActionButton
            icon={<Table size={iconSize} className={iconStyle} />}
            onPressedChange={insertTable}
            ariaLabel="Insert Table"
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("insertTable")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

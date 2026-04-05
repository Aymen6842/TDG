import { Unlink } from "lucide-react";
import type { Editor } from "@tiptap/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface Props {
  editor: Editor;
  iconSize?: number;
  iconStyle?: string;
}

export function TiptapUnlink({ editor, iconSize = 18, iconStyle = "" }: Props) {
  const t = useTranslations("shared.forms.textEditor.unlink");
  const isActive = editor.isActive("link");

  const handleUnlink = () => {
    editor.chain().focus().unsetLink().run();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUnlink}
            disabled={!isActive}
            type="button"
            className={`h-8 w-8 ${isActive ? "bg-muted" : ""}`}
            aria-label={t("tooltip")}
            aria-pressed={isActive}>
            <Unlink size={iconSize} className={iconStyle} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center" className="max-w-[200px] text-center">
          <p>{t("tooltip")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

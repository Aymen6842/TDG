import { useState, useEffect } from "react";
import { Editor } from "@tiptap/react";
import { LinkIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  editor: Editor;
}

export function TiptapLinkInsert({ editor }: Props) {
  const t = useTranslations("shared.forms.textEditor.link");
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("https://");
  const [text, setText] = useState("");

  //checking if the selected text has a link
  useEffect(() => {
    const href = editor.getAttributes("link").href;
    if (href) {
      setUrl(href);
    }
  }, [editor.state.selection]);

  // Check if there's already a link at the current selection
  const checkForExistingLink = () => {
    if (!editor) return false;

    const { from, to } = editor.state.selection;
    const linkMark = editor.schema.marks.link;

    let hasLink = false;
    editor.state.doc.nodesBetween(from, to, (node) => {
      if (node.marks.some((mark) => mark.type === linkMark)) {
        hasLink = true;
      }
    });

    return hasLink;
  };

  // Get the URL of the existing link if any
  const getExistingUrl = () => {
    if (!editor) return "";

    const { from, to } = editor.state.selection;
    const linkMark = editor.schema.marks.link;

    let existingUrl = "";
    editor.state.doc.nodesBetween(from, to, (node) => {
      node.marks.forEach((mark) => {
        if (mark.type === linkMark) {
          existingUrl = mark.attrs.href;
        }
      });
    });

    return existingUrl;
  };

  // Initialize form when dialog opens
  useEffect(() => {
    if (isOpen && editor) {
      const hasLink = checkForExistingLink();

      if (hasLink) {
        setUrl(getExistingUrl());
      } else {
        setUrl("https://");
      }

      // Get selected text
      const selectedText = editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        " "
      );
      setText(selectedText);
    }
  }, [isOpen, editor]);

  const handleButtonClick = () => {
    if (!editor) return;
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
    setUrl("https://");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editor) return;

    if (["", "https://", "http://"].includes(url)) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setIsOpen(false);
      return;
    }

    // If no text was selected, use the URL as text or the text input if provided
    if (editor.state.selection.empty) {
      const linkText = text || url;
      editor.chain().focus().insertContent(`<a href="${url}">${linkText}</a>`).run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }

    setIsOpen(false);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={handleButtonClick}
              className={`h-8 w-8 ${editor.isActive("link") ? "bg-muted" : ""}`}
              aria-label={t("labels.title")}>
              <LinkIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center" className="max-w-[200px] text-center">
            <p>{t("tooltip")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("labels.title")}</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-end space-y-6">
            <div className="bg-muted/30 w-full rounded-md">
              <div className="space-y-2">
                <Label htmlFor="url">{t("labels.url")}</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://"
                  autoFocus
                />
              </div>
            </div>
            <div className="via-border h-px w-full bg-gradient-to-r from-transparent to-transparent" />
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                id="form-cancel-button-bottom">
                <p>{t("labels.cancel")}</p>
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}

                id="form-submit-button-bottom">
                <p>{t("labels.save")}</p>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

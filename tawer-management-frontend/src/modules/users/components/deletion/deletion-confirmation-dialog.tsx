import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface DeletionConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  warning?: string;
  onCancel: () => void;
  onConfirm: () => void;
  isPending?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export default function DeletionConfirmationDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  warning,
  onCancel,
  onConfirm,
  isPending = false,
  confirmText,
  cancelText
}: DeletionConfirmationDialogProps) {
  const t = useTranslations("shared.dialogs.deletion");
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <p className="text-muted-foreground">{description}</p>
            {warning && <p className="text-destructive text-sm">{warning}</p>}
          </div>
        </div>
        <DialogFooter className="flex-row justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            {cancelText || t("cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? t("deleting") : confirmText || t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

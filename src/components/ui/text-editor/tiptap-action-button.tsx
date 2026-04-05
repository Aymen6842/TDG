import { Toggle } from "@/components/ui/toggle";

interface TiptapActionButtonProps {
  icon: React.ReactNode;
  pressed?: boolean;
  onPressedChange: () => void;
  ariaLabel: string;
}

export default function TiptapActionButton({
  icon,
  ariaLabel,
  ...props
}: TiptapActionButtonProps) {
  return (
    <Toggle {...props} aria-label={ariaLabel}>
      {icon}
    </Toggle>
  );
}

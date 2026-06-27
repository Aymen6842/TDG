import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import useCompany from "@/hooks/use-company";
import { CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function DailyWelcomPopUP({ isOpen, setIsOpen }: Props) {
  const t = useTranslations("modules.tracking.welcome.daily");
  const { company } = useCompany();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="animate-in zoom-in slide-in-from-bottom border-2 shadow-2xl duration-500 sm:max-w-md">
        <DialogHeader>
          <div className="relative mx-auto mb-4">
            <div className="from-chart-1 to-chart-4 animate-scale-bounce flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br shadow-lg">
              <CircleCheck
                strokeWidth={2.5}
                className="text-primary-foreground animate-check-draw h-10 w-10"
              />
            </div>
            <div className="bg-chart-4 animate-confetti-1 absolute -top-2 -left-2 h-3 w-3 rounded-full" />
            <div className="bg-chart-2 animate-confetti-2 absolute -top-3 right-2 h-2 w-2 rounded-full" />
            <div className="bg-chart-5 animate-confetti-5 absolute top-2 -left-4 h-2 w-2 rounded-full" />
            <div className="bg-chart-3 animate-confetti-3 absolute -bottom-1 left-0 h-2 w-2 rounded-full" />
            <div className="bg-chart-1 animate-confetti-4 absolute -right-3 -bottom-2 h-3 w-3 rounded-full" />
            <div className="bg-chart-2 animate-confetti-6 absolute right-0 bottom-2 h-2 w-2 rounded-full" />
            <div className="bg-chart-4 animate-confetti-7 absolute top-0 right-4 h-2 w-2 rounded-full" />
          </div>

          <DialogTitle className="from-primary to-accent animate-in slide-in-from-top bg-gradient-to-r bg-clip-text text-center text-3xl font-bold text-transparent duration-500">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground animate-in fade-in pt-4 text-center text-base leading-relaxed delay-200 duration-700">
            {t.rich("description", {
              company: () => <span className="font-bold">{company.name}</span>
            })}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

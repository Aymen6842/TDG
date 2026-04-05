"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import DailyWelcomPopUP from "./welcome"
import { Loader2, Smile, Building2, Home, Clock, Check, Eye } from "lucide-react"
import { useTranslations } from "next-intl"
import useCompany from "@/hooks/use-company"
import { cn } from "@/lib/utils"
import useAttendance from "../../hook/work-sessions/use-attendance"
import useWorkSession from "../../hook/work-sessions/use-work-session"
import { useViewerModeStore } from "../../store/viewer-mode-store"

export function CheckInScreen() {
  const t = useTranslations("modules.tracking.checkIn")

  const { company } = useCompany()
  const { workSession } = useWorkSession();
  const { viewerModeIsActive } = useViewerModeStore(store => store)
  const { checkIn, isPending, joinPlatformAsViewer } = useAttendance()
  const [showWelcome, setShowWelcome] = useState(false)
  const [location, setLocation] = useState<"onSite" | "remote" | null>(null)

  const isCheckedIn = workSession.status === "in"

  const handleCheckIn = async () => {
    if (!location) return;
    const res = await checkIn(location)
    if (!res) return
    setShowWelcome(true)
  }

  if ((isCheckedIn && !showWelcome) || viewerModeIsActive) {
    return null
  }

  return (
    <>
      {!(isCheckedIn) && (
        <div className="bg-background overflow-y-auto animate-in fade-in fixed inset-0 z-50 flex flex-col items-center justify-center duration-500">
          {/* Background Gradients */}
          <div className="from-primary/10 via-background to-accent/10 animate-in fade-in absolute inset-0 bg-gradient-to-br duration-1000 pointer-events-none" />
          <div className="from-accent/5 to-primary/5 animate-pulse-subtle absolute inset-0 bg-gradient-to-tl via-transparent pointer-events-none" />

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="bg-primary/20 animate-float-mega absolute top-[10%] left-[15%] h-32 w-32 rounded-full blur-3xl" />
            <div className="bg-accent/20 animate-float-mega-delayed absolute top-[60%] right-[10%] h-40 w-40 rounded-full blur-3xl" />
            <div className="bg-primary/40 shadow-primary/30 animate-float absolute top-[20%] left-[25%] h-4 w-4 rounded-full shadow-lg" />
            <div className="bg-accent/50 shadow-accent/30 animate-float-delayed absolute top-[30%] right-[20%] h-5 w-5 rounded-full shadow-lg" />
            <div className="bg-primary/50 shadow-primary/30 animate-float-slow absolute bottom-[35%] left-[30%] h-3 w-3 rounded-full shadow-md" />
            <div className="bg-accent/40 shadow-accent/30 animate-float absolute top-[65%] right-[35%] h-4 w-4 rounded-full shadow-md" />
            <div className="bg-primary/60 shadow-primary/30 animate-float-delayed absolute bottom-[20%] left-[60%] h-3 w-3 rounded-full shadow-md" />
            <div className="bg-accent/45 shadow-accent/30 animate-float-slow absolute top-[45%] left-[10%] h-5 w-5 rounded-full shadow-lg" />
            <div className="bg-primary/35 shadow-primary/30 animate-float-mega absolute right-[25%] bottom-[50%] h-4 w-4 rounded-full shadow-md" />
          </div>

          <Card className="bg-card/98 animate-in zoom-in relative z-10 mx-4 w-full max-w-2xl border-0 p-0 shadow-2xl backdrop-blur-lg duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden rounded-2xl">
              {/* Left side: Greeting */}
              <div className="from-primary/5 to-primary/0 flex flex-col items-center justify-center space-y-6 bg-gradient-to-br p-12 text-center md:min-h-96">
                <div className="inline-block">
                  <div
                    className={`from-primary to-accent/50 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br shadow-lg transition-all duration-500 ${isPending ? "scale-0 rotate-180 opacity-0" : "animate-bounce-float scale-100"
                      }`}
                  >
                    <Smile strokeWidth={2} className="text-primary-foreground animate-wiggle h-10 w-10" />
                  </div>
                </div>

                <div className="animate-in slide-in-from-top space-y-3 delay-200 duration-700">
                  <h1 className="text-foreground animate-text-shimmer text-2xl font-bold tracking-tight">
                    {t.rich("title", {
                      company: () => <span className="text-primary">{company.name}</span>,
                    })}
                  </h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t("subtitle")}</p>
                </div>

                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>

              {/* Right side: Options */}
              <div className="flex flex-col justify-between gap-3 p-6">

                {
                  (["remote", "onSite"] as ("remote" | "onSite")[]).map((workMode) => (
                    <button
                      key={workMode}
                      onClick={() => setLocation(workMode)}
                      disabled={isPending}
                      className={cn("group relative flex flex-col items-start gap-4 rounded-xl border-2 p-6 transition-all duration-300", {
                        "border-primary/60 bg-gradient-to-br from-primary/15 to-primary/8 shadow-lg": location === workMode,
                        "border-primary/20 bg-gradient-to-br from-primary/8 to-primary/5 hover:border-primary/40 hover:from-primary/12 hover:to-primary/6": location !== workMode,
                        "opacity-50 cursor-not-allowed": isPending,
                        "cursor-pointer": !isPending
                      })}
                    >
                      <div className="flex w-full items-start justify-between">
                        <div className="flex flex-col items-start gap-2">
                          <div
                            className={cn("rounded-lg p-2.5 transition-all duration-300", {
                              "bg-primary/30 scale-100": location === workMode,
                              "bg-primary/20 group-hover:bg-primary/25 scale-100": location !== workMode
                            })}

                          >
                            {workMode === "remote" ? <Home className="h-5 w-5 text-primary" /> : <Building2 className="h-5 w-5 text-primary" />}
                          </div>
                          <div className="space-y-1 text-left">
                            <h3 className="text-foreground font-semibold text-sm">{
                              workMode === "remote" ? t("remoteCheckIn") : t("officeCheckIn")
                            }</h3>
                          </div>
                        </div>
                        {location === workMode && (
                          <div className="rounded-full bg-primary/20 p-1.5">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </div>

                    </button>
                  ))
                }


                {/* Join platform without check-in */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={joinPlatformAsViewer}
                        variant="outline"
                        size="lg"
                        className="w-full border-dashed"
                      >
                        <Eye />
                        <span className="flex items-center justify-center gap-2">

                          {t("joinPlatformWithoutCheckIn")}
                        </span>
                      </Button>
                    </TooltipTrigger>

                    <TooltipContent side="top" className="max-w-xs text-sm">
                      {t("viewerTooltip")}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>


                <Button
                  onClick={handleCheckIn}
                  disabled={isPending || !location}
                  size="lg"
                  className="from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground relative w-full overflow-hidden bg-gradient-to-r px-6 py-3 text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t("checkingIn")}
                      </>
                    ) : (
                      "Check In"
                    )}
                  </span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <DailyWelcomPopUP isOpen={showWelcome} setIsOpen={setShowWelcome} />
    </>
  )
}

"use client";;
import { useEffect, useMemo, useState } from "react";
import { RiCalendarCheckLine } from "@remixicon/react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameMonth,
  startOfWeek,
  subMonths,
  subWeeks
} from "date-fns";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import {
  addHoursToDate,
  AgendaDaysToShow,
  AgendaView,
  CalendarDndProvider,
  CalendarEventType,
  CalendarView,
  DayView,
  EventDialog,
  EventGap,
  EventHeight,
  MonthView,
  WeekCellsHeight,
  WeekView
} from ".";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { getDisplayedDaysInCalendar } from "../../utils/calendar-days";
import { useEventStore } from "../../store/events";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import Loading from "@/components/page-loader";

export interface EventCalendarProps {
  events?: CalendarEventType[];
  isLoading?: boolean;
  onEventAdd?: (event: CalendarEventType) => Promise<boolean>;
  onEventUpdate?: (event: CalendarEventType) => Promise<boolean>;
  onEventDelete?: (eventId: string) => Promise<boolean>;
  className?: string;
  initialView?: CalendarView;
  setDisplayedDateRanges?: (params: { from: Date; to: Date }) => void;
}

export function EventCalendar({
  events = [],
  onEventAdd,
  isLoading = false,
  onEventUpdate,
  onEventDelete,
  className,
  initialView = "month",
  setDisplayedDateRanges
}: EventCalendarProps) {
  const t = useTranslations("modules.events");

  const eventType = useEventStore(store => store.eventType);
  const { user } = useCurrentUser();
  const userHasCreationPermission = eventType === "personalEvent" ? true : user ? hasPermissions(user.roles, eventType === "meeting" ? "meetingsManagement" : "eventsManagement", "add") : false;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(initialView);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventType | null>(null);

  useEffect(() => {
    const displayedDays = getDisplayedDaysInCalendar(currentDate, view);

    setDisplayedDateRanges?.(displayedDays);
  }, [currentDate, view]);

  // Add keyboard shortcuts for view switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input, textarea or contentEditable element
      // or if the event dialog is open
      if (
        isEventDialogOpen ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "m":
          setView("month");
          break;
        case "w":
          setView("week");
          break;
        case "d":
          setView("day");
          break;
        case "a":
          setView("agenda");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEventDialogOpen]);

  const handlePrevious = () => {
    if (view === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (view === "day") {
      setCurrentDate(addDays(currentDate, -1));
    } else if (view === "agenda") {
      // For agenda view, go back 30 days (a full month)
      setCurrentDate(addDays(currentDate, -AgendaDaysToShow));
    }
  };

  const handleNext = () => {
    if (view === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (view === "day") {
      setCurrentDate(addDays(currentDate, 1));
    } else if (view === "agenda") {
      // For agenda view, go forward 30 days (a full month)
      setCurrentDate(addDays(currentDate, AgendaDaysToShow));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventSelect = (event: CalendarEventType) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleEventCreate = (startTime: Date) => {
    if (!userHasCreationPermission) return;
    // Snap to 15-minute intervals
    const minutes = startTime.getMinutes();
    const remainder = minutes % 15;
    if (remainder !== 0) {
      if (remainder < 7.5) {
        // Round down to nearest 15 min
        startTime.setMinutes(minutes - remainder);
      } else {
        // Round up to nearest 15 min
        startTime.setMinutes(minutes + (15 - remainder));
      }
      startTime.setSeconds(0);
      startTime.setMilliseconds(0);
    }
    const newEvent: CalendarEventType = {
      id: "",
      title: "",
      startDate: startTime,
      endDate: addHoursToDate(startTime, 1)
    };
    setSelectedEvent(newEvent);
    setIsEventDialogOpen(true);

  };

  const handleEventDelete = async (eventId: string) => {
    const deletedEvent = events.find((event) => event.id === eventId)!;
    const res = await onEventDelete?.(eventId);

    // Show toast notification when an event is deleted
    if (res && deletedEvent) {
      toast(t("notifications.eventDeleted", { title: deletedEvent.title }), {
        description: format(new Date(deletedEvent.startDate), "MMM d, yyyy"),
        position: "bottom-left"
      });

      setIsEventDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  const handleEventUpdate = async (updatedEvent: CalendarEventType) => {
    const res = await onEventUpdate?.(updatedEvent);

    // Show toast notification when an event is updated via drag and drop
    if (res)
      toast(t("notifications.eventMoved", { title: updatedEvent.title }), {
        description: format(new Date(updatedEvent.startDate), "MMM d, yyyy"),
        position: "bottom-left"
      });
  };

  const viewTitle = useMemo(() => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy");
    } else if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy");
      } else {
        return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`;
      }
    } else if (view === "day") {
      return (
        <>
          <span className="min-[480px]:hidden" aria-hidden="true">
            {format(currentDate, "MMM d, yyyy")}
          </span>
          <span className="max-[479px]:hidden min-md:hidden" aria-hidden="true">
            {format(currentDate, "MMMM d, yyyy")}
          </span>
          <span className="max-md:hidden">{format(currentDate, "EEE MMMM d, yyyy")}</span>
        </>
      );
    } else if (view === "agenda") {
      // Show the month range for agenda view
      const start = currentDate;
      const end = addDays(currentDate, AgendaDaysToShow - 1);

      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy");
      } else {
        return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`;
      }
    } else {
      return format(currentDate, "MMMM yyyy");
    }
  }, [currentDate, view]);

  return (
    <div
      className="flex min-h-[calc(100vh-var(--header-height)-3rem)] flex-col rounded-lg border has-data-[slot=month-view]:flex-1"
      style={
        {
          "--event-height": `${EventHeight}px`,
          "--event-gap": `${EventGap}px`,
          "--week-cells-height": `${WeekCellsHeight}px`
        } as React.CSSProperties
      }>
      <CalendarDndProvider onEventUpdate={handleEventUpdate}>
        <div className={cn("flex items-center justify-between p-2 sm:p-4", className)}>
          <div className="flex items-center gap-1 sm:gap-4">
            <Button
              variant="outline"
              className="max-[479px]:aspect-square max-[479px]:p-0!"
              onClick={handleToday}
              aria-label={t("calendar.actions.today")}>
              <RiCalendarCheckLine className="min-[480px]:hidden" size={16} aria-hidden="true" />
              <span className="max-[479px]:sr-only">{t("calendar.actions.today")}</span>
            </Button>
            <div className="flex items-center sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                aria-label={t("calendar.actions.previous")}>
                <ChevronLeftIcon size={16} aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                aria-label={t("calendar.actions.next")}>
                <ChevronRightIcon size={16} aria-hidden="true" />
              </Button>
            </div>
            <h2 className="text-sm font-semibold sm:text-lg md:text-xl">{viewTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1.5 max-[479px]:h-8">
                  <span>
                    <span className="min-[480px]:hidden" aria-hidden="true">
                      {view.charAt(0).toUpperCase()}
                    </span>
                    <span className="max-[479px]:sr-only">{t(`calendar.views.${view}.name`)}</span>
                  </span>
                  <ChevronDownIcon className="-me-1 opacity-60" size={16} aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-32">
                <DropdownMenuItem onClick={() => setView("month")}>
                  {t("calendar.views.month.name")}
                  <DropdownMenuShortcut>
                    {t("calendar.views.month.name").charAt(0)}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView("week")}>
                  {t("calendar.views.week.name")}
                  <DropdownMenuShortcut>
                    {t("calendar.views.week.name").charAt(0)}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView("day")}>
                  {t("calendar.views.day.name")}
                  <DropdownMenuShortcut>
                    {t("calendar.views.day.name").charAt(0)}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView("agenda")}>
                  {t("calendar.views.agenda.name")}
                  <DropdownMenuShortcut>
                    {t("calendar.views.agenda.name").charAt(0)}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              className="max-[479px]:aspect-square max-[479px]:p-0!"
              size="sm"
              disabled={!userHasCreationPermission}
              onClick={() => {
                setSelectedEvent(null); // Ensure we're creating a new event
                setIsEventDialogOpen(true);
              }}
              aria-label={t("calendar.actions.newEvent")}>
              <PlusIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
              <span className="max-sm:sr-only">
                {eventType === "meeting"
                  ? t("calendar.actions.newMeeting")
                  : t("calendar.actions.newEvent")}
              </span>
            </Button>
          </div>
        </div>

        {isLoading ? <Loading /> : <div className="flex flex-1 flex-col">
          {view === "month" && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {view === "week" && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {view === "day" && (
            <DayView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {view === "agenda" && (
            <AgendaView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
            />
          )}
        </div>}

        <EventDialog
          event={selectedEvent}
          isOpen={isEventDialogOpen}
          onClose={() => {
            setIsEventDialogOpen(false);
            setSelectedEvent(null);
          }}
          onDelete={handleEventDelete}
        />
      </CalendarDndProvider>
    </div>
  );
}

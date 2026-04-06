import { format, parseISO } from "date-fns";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { RiCalendarLine } from "@remixicon/react";
import { Calendar } from "./ui/calendar";

interface Props {
  inputName: string;
  dateLabel: string;
  timeLabel: string;
}

export default function TimeInput({ inputName, dateLabel, timeLabel }: Props) {
  const form = useFormContext();

  const StartHour = 0;
  const EndHour = 24;

  // EDITED: added null guard — updateDateTime can receive undefined when form field not yet initialized
  const updateDateTime = (
    currentValue: string,
    timeString: string
  ) => {
    if (!currentValue) return;
    const date = parseISO(currentValue);
    const [hours, minutes] = timeString.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    form.setValue(inputName, date.toISOString(), { shouldValidate: true });
  };

  const timeOptions = useMemo(() => {
    const options = [];
    for (let hour = StartHour; hour <= EndHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const val = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        options.push({ value: val, label: format(new Date(2000, 0, 1, hour, minute), "h:mm a") });
      }
    }
    return options;
  }, []);



  return (
    <div className="flex gap-4">
      <FormField
        control={form.control}
        name={inputName}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>{dateLabel}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant="outline" className="w-full justify-between font-normal">
                    {format(parseISO(field.value || new Date().toISOString()), "PPP")}
                    <RiCalendarLine size={16} className="opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={parseISO(field.value || new Date().toISOString())}
                  onSelect={(date) => date && field.onChange(date.toISOString())}
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormItem className="w-[120px]">
        <FormLabel>{timeLabel}</FormLabel>
        <Select
          onValueChange={(v) => updateDateTime(form.getValues(inputName), v)}
          value={format(
            parseISO(form.watch(inputName) || new Date().toISOString()),
            "HH:mm"
          )}>
          <FormControl>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {timeOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormItem>
    </div>
  )

}
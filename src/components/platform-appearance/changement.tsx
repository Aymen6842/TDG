"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark"], {
    required_error: "Please select a theme."
  })
});

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

export default function PlatformAppearanceChangement() {
  const t = useTranslations("shared.theme");
  const { theme, setTheme } = useTheme();

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: (theme as "light" | "dark") || "light"
    }
  });

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form className="space-y-8">
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>{t("changement.title")}</FormLabel>
                  <FormDescription>{t("changement.subtitle")}</FormDescription>
                  <FormMessage />
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        setTheme(value);
                        field.onChange(value);
                      }}
                      defaultValue={field.value}
                      className="grid max-w-md grid-cols-2 gap-8 pt-2">
                      <FormItem>
                        <FormLabel className="[&:has([data-state=checked])>div]:border-primary flex-col">
                          <FormControl>
                            <RadioGroupItem value="light" className="sr-only" />
                          </FormControl>
                          <div className="hover:border-accent items-center rounded-lg border-2 p-1">
                            <div className="space-y-2 rounded-lg bg-[#ecedef] p-2">
                              <div className="space-y-2 rounded-md bg-white p-2 shadow-xs">
                                <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                              </div>
                              <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs">
                                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                              </div>
                              <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs">
                                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                              </div>
                            </div>
                          </div>{" "}
                          <span className="block w-full p-2 text-center font-normal">
                            {t("light")}
                          </span>
                        </FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormLabel className="[&:has([data-state=checked])>div]:border-primary flex-col">
                          <FormControl>
                            <RadioGroupItem value="dark" className="sr-only" />
                          </FormControl>
                          <div className="bg-popover hover:bg-accent hover:text-accent-foreground items-center rounded-lg border-2 p-1">
                            <div className="space-y-2 rounded-lg bg-slate-950 p-2">
                              <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-xs">
                                <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                              </div>
                              <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs">
                                <div className="h-4 w-4 rounded-full bg-slate-400" />
                                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                              </div>
                              <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs">
                                <div className="h-4 w-4 rounded-full bg-slate-400" />
                                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                              </div>
                            </div>
                          </div>
                          <span className="block w-full p-2 text-center font-normal">
                            {t("dark")}
                          </span>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

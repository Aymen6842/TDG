"use client";
import { CheckIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePathname } from "@/i18n/navigation";
import { useLanguages } from "@/hooks/use-languages";

export default function LanguageSelector() {
  const t = useTranslations("shared.header.languageSelector");
  const locale = useLocale();
  const pathname = usePathname();
  const { languages } = useLanguages();

  const handleLanguageChange = (languageCode: string) => {
    window.location.href = `/${languageCode}${pathname}`;
  };

  return (
    languages &&
    languages.length > 1 && (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-fit justify-between"
            aria-label={t("ariaLabel")}>
            <span className="text-sm font-medium">
              Language : {languages.find((language) => language.code === locale)?.name}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="end">
          <Command>
            <CommandInput placeholder={t("searchPlaceholder")} />
            <CommandList>
              <CommandEmpty>{t("noLanguageFound")}</CommandEmpty>
              <CommandGroup>
                {languages.map((language) => (
                  <CommandItem
                    value={language.code}
                    key={language.code}
                    onSelect={() => {
                      handleLanguageChange(language.code);
                    }}>
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        language.code === locale ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {language.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  );
}

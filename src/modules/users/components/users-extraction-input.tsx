"use client";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Loading from "@/components/page-loader";
import Error500 from "@/components/error/500";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import useUsers from "../hooks/extraction/use-users";
import { useFormContext } from "react-hook-form";

interface Props {
  setUsersIds?: (usersIds: string[]) => void;
  inputName: string;
  label?: string;
}

export default function UsersExtractionInput({ setUsersIds, inputName, label }: Props) {
  const t = useTranslations("modules.users.usersExtractionInput");

  const form = useFormContext();

  const {
    users,
    usersAreLoading,
    searchState: [search, setSearch]
  } = useUsers({});

  if (usersAreLoading) return <Loading />;
  if (!users) return <Error500 />;

  return (
    <FormField
      name={inputName}
      control={form.control}
      render={({ field }) => (
        <FormItem>
          <Label> {label || t("labels.users")}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full">
                <PlusCircle />
                {label || t("labels.users")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-full p-0">
              <Command className="w-full">
                <CommandInput
                  placeholder={t("placeholders.users")}
                  className="h-9"
                  value={search}
                  onValueChange={(val) => setSearch(val)}
                />

                <CommandList className="w-full">
                  <CommandEmpty>{t("noResults.users")}</CommandEmpty>

                  <CommandGroup>
                    <FormControl>
                      <CommandGroup>
                        {users?.map((user) => (
                          <CommandItem key={user.id} id={user.id}>
                            <div className="flex items-center space-x-3 py-1">
                              <Checkbox
                                id={user.id}
                                checked={field.value?.includes(user.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...(field.value ?? []), user.id]);
                                  } else {
                                    field.onChange(
                                      field.value?.filter((value: string) => value !== user.id)
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={user.id}
                                className="flex cursor-pointer items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarImage src={user.image} alt={user.name} />
                                  <AvatarFallback>
                                    {user.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>{user.name}</div>
                              </label>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </FormControl>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

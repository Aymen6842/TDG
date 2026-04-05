"use client";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { ErrorBanner } from "@/components/error-banner";
import { Label } from "@/components/ui/label";
import { TeamType } from "../../../types/teams";
import useTeamUpload from "../../../hooks/team-upload";
import useUsers from "../../../hooks/extraction/use-users";
import Loading from "@/components/page-loader";
import Error500 from "@/components/error/500";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect } from "react";

interface Props {
  onFinish: () => void;
  team?: TeamType;
}

export default function TeamUploadForm({ onFinish, team = undefined }: Props) {
  const t = useTranslations("modules.users.teams");

  const { form, isPending, onSubmit, error } = useTeamUpload({
    team,
    onSuccess: () => {
      form.reset();
      onFinish();
    }
  });

  const { users, usersAreLoading } = useUsers({});

  useEffect(() => {
    if (team)
      form.reset({
        name: team.name,
        manager: team.members.find((member) => member.isManager)?.id,
        members: team.members.filter((member) => !member.isManager).map((member) => member.id)
      });
  }, [team]);

  if (usersAreLoading) return <Loading />;
  if (!users) return <Error500 />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("upload.form.labels.name")}</FormLabel>
              <FormControl>
                <Input placeholder={t("upload.form.placeholders.name")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="manager"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <Label> {t("upload.form.labels.managers")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <PlusCircle />
                    {t("upload.form.labels.managers")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-0">
                  <Command>
                    <CommandInput
                      placeholder={t("upload.form.placeholders.managers")}
                      className="h-9"
                    />

                    <CommandList className="">
                      <CommandEmpty>{t("upload.form.noResults.managers")}</CommandEmpty>

                      <CommandGroup>
                        <FormControl>
                          <CommandGroup>
                            <RadioGroup value={field.value} onValueChange={field.onChange}>
                              {users &&
                                users.map((user) => (
                                  <CommandItem key={user.id} value={user.id}>
                                    <div className="flex items-center space-x-3 py-1">
                                      <RadioGroupItem value={user.id} id={user.id} />

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
                            </RadioGroup>
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

        <FormField
          name="members"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <Label> {t("upload.form.labels.members")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <PlusCircle />
                    {t("upload.form.labels.members")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-0">
                  <Command>
                    <CommandInput
                      placeholder={t("upload.form.placeholders.members")}
                      className="h-9"
                    />

                    <CommandList className="">
                      <CommandEmpty>{t("upload.form.noResults.members")}</CommandEmpty>

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
                                          field.value?.filter((value) => value !== user.id)
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

        {error !== "" && <ErrorBanner error={error} />}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onFinish} disabled={isPending}>
            {t("actions.cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? t("actions.creating")
              : team
                ? t("actions.updateTeam")
                : t("actions.createTeam")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

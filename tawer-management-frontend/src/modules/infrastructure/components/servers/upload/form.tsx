"use client";;
import { useTranslations } from "next-intl";
import { PlusCircle } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorBanner } from "@/components/error-banner";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import useUsers from "@/modules/users/hooks/extraction/use-users";
import Loading from "@/components/page-loader";
import Error500 from "@/components/error/500";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useServerUpload from "@/modules/infrastructure/hooks/uploads/server";
import { ServerStatusType, ServerType } from "@/modules/infrastructure/types/servers";
import TextEditor from "@/components/ui/text-editor";
import TimeInput from "@/components/time-input";

interface Props {
  onFinish: () => void
  server?: ServerType
}

export default function ServerUploadForm({ onFinish, server = undefined }: Props) {
  const t = useTranslations("modules.infrastructure.servers")

  const { form, isPending, onSubmit, error } = useServerUpload({
    server,
    onSuccess: () => {
      form.reset()
      onFinish()
    },
  })

  const { users, usersAreLoading } = useUsers({})

  useEffect(() => {
    if (server) {
      form.reset({
        name: server.name,
        domain: server.domain,
        description: server.description,
        ip: server.ip,
        cpus: server.cpus,
        ram: server.ram,
        storage: server.storage,
        bandwidth: server.bandwidth,
        status: server.status,
        backupCloudProvider: server.backupCloudProvider,
        paid: server.paid,
        paidAt: server.paidAt,
        expiredAt: server.expiredAt,
        managers: server.managers.map((m) => m.id),
      })
    }
  }, [server])

  const onStatusChanged = (status: ServerStatusType) => {
    if (status)
      form.setValue("status", status);

  }

  if (usersAreLoading) return <Loading />
  if (!users) return <Error500 />

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
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
            name="domain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("upload.form.labels.domain")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("upload.form.placeholders.domain")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="ip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("upload.form.labels.ip")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("upload.form.placeholders.ip")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="cpus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("upload.form.labels.cpus")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("upload.form.placeholders.cpus")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="ram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("upload.form.labels.ram")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("upload.form.placeholders.ram")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="storage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("upload.form.labels.storage")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("upload.form.placeholders.storage")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="bandwidth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("upload.form.labels.bandwidth")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("upload.form.placeholders.bandwidth")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("upload.form.labels.status")}</FormLabel>
                <Select value={field.value} onValueChange={onStatusChanged}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Running">{t("upload.form.statuses.running")}</SelectItem>
                    <SelectItem value="Stopped">{t("upload.form.statuses.stopped")}</SelectItem>
                    <SelectItem value="Maintenance">{t("upload.form.statuses.maintenance")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField

            name="backupCloudProvider"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>{t("upload.form.labels.backupCloudProvider")}</FormLabel>
              </FormItem>
            )}
          />

          <FormField

            name="paid"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>{t("upload.form.labels.paid")}</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            name="managers"
            render={({ field }) => (
              <FormItem>
                <Label>{t("upload.form.labels.managers")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full bg-transparent">
                      <PlusCircle />
                      {t("upload.form.labels.managers")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-52 p-0">
                    <Command>
                      <CommandInput placeholder={t("upload.form.placeholders.managers")} className="h-9" />

                      <CommandList className="">
                        <CommandEmpty>{t("upload.form.noResults.managers")}</CommandEmpty>

                        <CommandGroup>
                          <FormControl>
                            <CommandGroup>
                              {users &&
                                users.map((user) => (
                                  <CommandItem key={user.id} value={user.id}>
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
                                        }} />

                                      <label htmlFor={user.id} className="flex cursor-pointer items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                          <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                                          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
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
        </div>

        <TimeInput inputName="paidAt" dateLabel={t("upload.form.labels.paidDate")} timeLabel={t("upload.form.labels.paidTime")} />
        <TimeInput inputName="expiredAt" dateLabel={t("upload.form.labels.expiredDate")} timeLabel={t("upload.form.labels.expiredTime")} />


        <FormField
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("upload.form.labels.description")}</FormLabel>
              <FormControl>
                <TextEditor
                  initialContent={server?.description || ""}
                  placeholder={t("upload.form.placeholders.description")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />



        {error !== "" && <ErrorBanner error={error} />}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onFinish} disabled={isPending}>
            {t("upload.form.actions.cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? t("upload.form.actions.creating")
              : server
                ? t("upload.form.actions.updateServer")
                : t("upload.form.actions.createServer")}
          </Button>
        </div>
      </form>
    </Form>
  )
}

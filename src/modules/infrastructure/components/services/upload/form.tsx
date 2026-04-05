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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Loading from "@/components/page-loader";
import Error500 from "@/components/error/500";
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useServiceUpload from "@/modules/infrastructure/hooks/uploads/service";
import type { ServiceStatusType, ServiceType } from "@/modules/infrastructure/types/services";
import useServers from "@/modules/infrastructure/hooks/extractions/servers";
import TextEditor from "@/components/ui/text-editor";
import TimeInput from "@/components/time-input";
import { logger } from "@/lib/logger";

interface Props {
  onFinish: () => void
  service?: ServiceType
}

export default function ServiceUploadForm({ onFinish, service = undefined }: Props) {
  const t = useTranslations("modules.infrastructure.services")

  const { form, isPending, onSubmit, error } = useServiceUpload({
    service,
    onSuccess: () => {
      form.reset()
      onFinish()
    },
  })

  const { servers, serversAreLoading } = useServers({})

  useEffect(() => {
    if (service) {
      logger.log(`status: ${service.status}`)
      form.reset({
        name: service.name,
        domain: service.domain,
        description: service.description,
        status: service.status,
        sslCertificate: service.sslCertificate,
        sslCertificateByCloudProvider: service.sslCertificateByCloudProvider,
        hasBackup: service.hasBackup,
        backupDestination: service.backupDestination,
        paid: service.paid,
        paidAt: service.paidAt,
        expiredAt: service.expiredAt,
        serverId: service.server.id,
      })
    }
  }, [service])

  const onStatusChanged = (status: ServiceStatusType) => {
    if (status)
      form.setValue("status", status);

  }

  if (serversAreLoading) return <Loading />
  if (!servers) return <Error500 />

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("upload.form.labels.description")}</FormLabel>
              <FormControl>
                <TextEditor
                  initialContent={service?.description || ""}
                  placeholder={t("upload.form.placeholders.description")}
                  {...field}
                />
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
          )
          }
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            name="sslCertificate"
            render={({ field }) => (
              <FormItem className="">
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Checkbox id={field.name} checked={field.value} onCheckedChange={field.onChange} />
                    <FormLabel htmlFor={field.name}>{t("upload.form.labels.sslCertificate")}</FormLabel>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="sslCertificateByCloudProvider"
            render={({ field }) => (
              <FormItem className="">
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Checkbox id={field.name} checked={field.value} onCheckedChange={field.onChange} />
                    <FormLabel htmlFor={field.name}>{t("upload.form.labels.sslCertificateByCloudProvider")}</FormLabel>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="hasBackup"
            render={({ field }) => (
              <FormItem className="">
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Checkbox id={field.name} checked={field.value} onCheckedChange={field.onChange} />
                    <FormLabel htmlFor={field.name}>{t("upload.form.labels.hasBackup")}</FormLabel>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          name="backupDestination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("upload.form.labels.backupDestination")}</FormLabel>
              <FormControl>
                <Input placeholder={t("upload.form.placeholders.backupDestination")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="paid"
          render={({ field }) => (
            <FormItem className="">
              <FormControl>
                <div className="flex items-center gap-2">
                  <Checkbox id={field.name} checked={field.value} onCheckedChange={field.onChange} />
                  <FormLabel htmlFor={field.name}>{t("upload.form.labels.paid")}</FormLabel>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <TimeInput inputName="paidAt" dateLabel={t("upload.form.labels.paidDate")} timeLabel={t("upload.form.labels.paidTime")} />
        <TimeInput inputName="expiredAt" dateLabel={t("upload.form.labels.expiredDate")} timeLabel={t("upload.form.labels.expiredTime")} />


        <FormField
          name="serverId"
          render={({ field }) => (
            <FormItem>
              <Label>{t("upload.form.labels.serverId")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full bg-transparent">
                    <PlusCircle />
                    {t("upload.form.labels.serverId")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-0">
                  <Command>
                    <CommandInput placeholder={t("upload.form.placeholders.serverId")} className="h-9" />

                    <CommandList className="">
                      <CommandEmpty>{t("upload.form.noResults.serverId")}</CommandEmpty>

                      <CommandGroup>
                        <FormControl>
                          <CommandGroup>
                            <RadioGroup value={field.value || ""} onValueChange={(val) => field.onChange(val)}>
                              {servers &&
                                servers.map((server) => (
                                  <CommandItem key={server.id} value={server.id}>
                                    <div className="flex items-center space-x-3 py-1">
                                      <RadioGroupItem value={server.id} id={server.id} />

                                      <label htmlFor={server.id} className="flex cursor-pointer items-center gap-3">

                                        <div>{server.name}</div>
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

        {error !== "" && <ErrorBanner error={error} />}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onFinish} disabled={isPending}>
            {t("upload.form.actions.cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? t("upload.form.actions.creating")
              : service
                ? t("upload.form.actions.updateService")
                : t("upload.form.actions.createService")}
          </Button>
        </div>
      </form>
    </Form>
  )
}

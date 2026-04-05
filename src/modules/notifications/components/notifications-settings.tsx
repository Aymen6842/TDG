"use client";;
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2 } from "lucide-react";
import Loading from "@/components/page-loader";
import useNotificationsSettingsUpload from "../hook/use-notifications-settings-upload";
import { ErrorBanner } from "@/components/error-banner";
import usePersonalNotificationsSettings from "../hook/use-personal-notifications-settings";
import useCopy from "@/hooks/use-copy";
import Link from "next/link";

export default function NotificationSettings() {
  const t = useTranslations("modules.notifications.settings");

  const { settings, isLoading } = usePersonalNotificationsSettings();
  const {
    error,
    emailNotifications,
    setEmailNotifications,
    telegramNotifications,
    setTelegramNotifications,
    telegramChatId,
    setTelegramChatId,
    ntfyNotifications,
    setNtfyNotifications,
    onSubmit,
    isPending
  } = useNotificationsSettingsUpload();
  const { copied, copyToClipboard } = useCopy()


  if (isLoading) return <Loading />

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      {/* Email */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-base font-medium">{t("email.description")}</CardTitle>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("email.details")}</p>
        </CardContent>
      </Card>

      {/* Telegram */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base font-medium">{t("telegram.description")}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{t("telegram.details")}</p>
            </div>
            <Switch
              checked={telegramNotifications}
              onCheckedChange={(checked) => setTelegramNotifications(checked)}
              className="ml-4"
            />
          </div>
        </CardHeader>

        {telegramNotifications && (
          <CardContent className="space-y-4 border-t pt-4">
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
                {t("telegram.chatId.label")}
              </label>
              <Input
                type="text"
                placeholder={t("telegram.chatId.placeholder")}
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-2">{t("telegram.chatId.hint")}</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* NTFY */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base font-medium">{t("ntfy.toggle.description")}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{t("ntfy.toggle.details")}</p>
            </div>
            <Switch
              checked={ntfyNotifications}
              onCheckedChange={setNtfyNotifications}
              className="ml-4"
            />
          </div>
        </CardHeader>

        {ntfyNotifications && (
          <CardContent className="space-y-4 border-t pt-4">
            <ol className="text-muted-foreground space-y-2 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-foreground font-semibold">1.</span>
                <span className="flex space-x-1">{t.rich("ntfy.steps.step1", {
                  link: (text) => <Button variant={"link"} className=" w-fit h-fit py-0 px-1"><Link href="https://ntfy.sh" target="_blank">{text}</Link></Button>
                })}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-foreground font-semibold">2.</span>
                <span>{t("ntfy.steps.step2")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-foreground font-semibold">3.</span>
                <span>{t.rich("ntfy.steps.step3", {
                  url: () => <span className="font-bold">{process.env.NTFY_SERVICE_URL as string}</span>
                })}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-foreground font-semibold">4.</span>
                <span>{t("ntfy.steps.step4")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-foreground font-semibold">4.</span>
                <span>{t("ntfy.steps.step5")}</span>
              </li>
            </ol>

            <div className="bg-muted rounded-lg p-4">
              <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wide">
                {t("ntfy.topic.label")}
              </p>
              {settings && <div className="flex items-center gap-2">
                <code className="bg-background flex-1 rounded px-3 py-2 font-mono text-sm">{settings.ntfyTopic}</code>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard({ text: settings.ntfyTopic })} className="gap-2 bg-transparent">
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {t("ntfy.topic.copied")}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      {t("ntfy.topic.copy")}
                    </>
                  )}
                </Button>
              </div>}
            </div>
          </CardContent>
        )}
      </Card>

      {
        error && (
          <ErrorBanner error={error} closeButtonIsUsed={false} />
        )
      }
      <Button onClick={onSubmit} disabled={isPending} className="w-full h-11 text-base font-medium">
        {isPending ? t("button.saving") : t("button.saveChanges")}
      </Button>
    </div>
  );
}

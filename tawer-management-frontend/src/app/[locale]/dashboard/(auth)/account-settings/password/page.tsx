"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import usePasswordChangement from "@/modules/auth/hooks/users/use-password-changement";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("modules.auth.account.passwordChangement");
  const { form, submitPassword, isLoading } = usePasswordChangement();

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submitPassword)} className="space-y-8">
            {/* Current password */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("currentPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      isPasswordInput
                      type="password"
                      placeholder={t("currentPasswordPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t("currentPasswordDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New password */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("newPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      isPasswordInput
                      type="password"
                      placeholder={t("newPasswordPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t("newPasswordDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm password */}
            <FormField
              control={form.control}
              name="confirmationPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("confirmationPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      isPasswordInput
                      type="password"
                      placeholder={t("confirmationPasswordPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t("confirmationPasswordDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("updatingButton") : t("updateButton")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

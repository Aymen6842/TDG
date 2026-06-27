"use client";
import { useTranslations } from "next-intl";

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
import LanguageSelector from "@/components/layout/header/language-selector";
import { useEffect } from "react";
import ProfileImageUpload from "@/components/images-upload/profile-image-upload";
import useUser from "../../hooks/users/use-user";
import useUserInfoChangement from "../../hooks/users/user-info-changement";
import { useLanguages } from "@/hooks/use-languages";

export default function PersonalInfoChangement() {
  const { user } = useUser();
  const { form, onSubmit, isPending } = useUserInfoChangement({ user });
  const t = useTranslations("modules.auth.account.personalInfoChangement");

  const { languages } = useLanguages();

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.name,
        phone: user.phone,
        imageUrl: user.image
      });
    }
  }, [user, form]);

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <ProfileImageUpload
              defaultImageUrl={form.watch(`imageUrl`)}
              defaultImageUrlInputName={`imageUrl`}
              inputName={`image`}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.name.label")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("fields.name.placeholder")} {...field} />
                  </FormControl>
                  <FormDescription>{t("fields.name.description")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.phone.label")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("fields.phone.placeholder")} {...field} />
                  </FormControl>
                  <FormDescription>{t("fields.phone.description")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>{t("fields.email.label")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("fields.email.placeholder")}
                  value={user ? user.email : ""}
                  disabled
                />
              </FormControl>
              <FormDescription>{t("fields.email.description")}</FormDescription>
              <FormMessage />
            </FormItem>
            {languages && languages.length > 1 && (
              <div className="space-y-2">
                <FormLabel>{t("fields.language.label")}</FormLabel>
                <div className="flex items-center gap-2">
                  <LanguageSelector />
                </div>
              </div>
            )}
            <Button type="submit" disabled={isPending}>
              {isPending ? t("actions.updating") : t("actions.update")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

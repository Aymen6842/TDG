"use client";

import { useTranslations } from "next-intl";
import type React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";

import ProfileImageUpload from "@/components/images-upload/profile-image-upload";
import useSignUp from "../../hooks/use-sign-up";

export default function SignUpForm({ className, ...props }: React.ComponentProps<"div">) {
  const t = useTranslations("modules.auth.signUp");
  const { error, onSubmit, isPending, form } = useSignUp();

  return (
    <div className="w-full max-w-md space-y-8 px-4">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold">{t("title")}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{t("description")}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <ProfileImageUpload inputName="image" />

            {/* Full Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="name" className="sr-only">
                    {t("fields.fullName.label")}
                  </Label>
                  <FormControl>
                    <Input
                      id="name"
                      placeholder={t("fields.fullName.placeholder")}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="email" className="sr-only">
                    {t("fields.email.label")}
                  </Label>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder={t("fields.email.placeholder")}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="phone" className="sr-only">
                    {t("fields.phone.label")}
                  </Label>
                  <FormControl>
                    <Input
                      id="phone"
                      autoComplete="tel"
                      placeholder={t("fields.phone.placeholder")}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="password" className="sr-only">
                    {t("fields.password.label")}
                  </Label>
                  <FormControl>
                    <Input
                      id="password"
                      type="password"
                      isPasswordInput
                      autoComplete="current-password"
                      placeholder={t("fields.password.placeholder")}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-end">
              <Link href="/forgot-password" className="text-sm underline">
                {t("fields.password.forgot")}
              </Link>
            </div>
          </div>

          {error && <p className="text-destructive text-center text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? t("actions.signingUp") : t("actions.signup")}
          </Button>
        </form>
      </Form>

      <div className="mt-6">
        {/* <div className="flex items-center gap-3">
          <div className="w-full border-t" />
          <span className="text-muted-foreground shrink-0 text-sm">{t("orContinueWith")}</span>
          <div className="w-full border-t" />
        </div>

        <Button variant="outline" className="mt-6 w-full" disabled={isPending}>
          {t("actions.signUpWithGoogle")}
        </Button> */}

        <div className="mt-6 text-center text-sm">
          {t("hasAccount")}{" "}
          <Link href="/login" className="underline underline-offset-4">
            {t("actions.login")}
          </Link>
        </div>
      </div>
    </div>
  );
}

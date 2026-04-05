"use client";
import { useTranslations } from "next-intl";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useSignIn from "../../hooks/use-sign-in";
import Link from "next/link";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

export default function SignInForm({ className, ...props }: React.ComponentProps<"div">) {
  const t = useTranslations("modules.auth.signIn");
  const { error, onSubmit, isPending, form } = useSignIn();

  return (
    <div className="w-full max-w-md space-y-8 px-4">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold">{t("title")}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{t("subtitle")}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
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
            {isPending ? t("actions.loggingIn") : t("actions.login")}
          </Button>
        </form>
      </Form>

      <div className="mt-6">
        {/* <div className="flex items-center gap-3">
          <div className="w-full border-t" />
          <span className="text-muted-foreground shrink-0 text-sm">{t("orContinueWith")}</span>
          <div className="w-full border-t" />
        </div> */}

        {/* <div className="mt-6 gap-3">
          <Button variant="outline" className="w-full" disabled={isPending}>
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t("actions.loginWithGoogle")}
          </Button>
        </div> */}

        <div className="mt-6 text-center text-sm">
          {t("noAccount")}{" "}
          <Link href="/register" className="underline">
            {t("actions.signup")}
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import UserSearchCombobox from "./user-search-combobox";
import useProjectMembers from "../../../hooks/members/use-project-members";

function buildAddMemberSchema(t: (key: string) => string) {
  return z.discriminatedUnion("mode", [
    z.object({
      mode: z.literal("userId"),
      value: z.string().min(1, t("validation.required")),
      isManager: z.boolean(),
      expiresInDays: z.coerce.number().min(1).max(30).optional(),
    }),
    z.object({
      mode: z.literal("email"),
      value: z.string().email(t("validation.invalidEmail")),
      isManager: z.boolean(),
      expiresInDays: z.coerce.number().min(1).max(30).optional(),
    }),
  ]);
}
type AddMemberForm = z.infer<ReturnType<typeof buildAddMemberSchema>>;

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function AddMemberDialog({ open, onOpenChange, projectId }: AddMemberDialogProps) {
  const t = useTranslations("modules.projects.project.details");
  const { addMember, isPending } = useProjectMembers(projectId);

  const form = useForm<AddMemberForm>({
    resolver: zodResolver(buildAddMemberSchema(t)),
    defaultValues: { value: "", isManager: false, expiresInDays: 7, mode: "userId" },
  });

  async function handleSubmit(data: AddMemberForm) {
    if (data.mode === "email") {
      await addMember({ email: data.value, isManager: data.isManager, expiresInDays: data.expiresInDays });
    } else {
      await addMember({ userId: data.value, isManager: data.isManager });
    }
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("membersList.addMember", { defaultValue: "Add Member" })}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="mode" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("membersList.addBy", { defaultValue: "Add by" })}</FormLabel>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant={field.value === "userId" ? "default" : "outline"} onClick={() => { field.onChange("userId"); form.setValue("value", ""); }}>{t("membersList.byUser")}</Button>
                  <Button type="button" size="sm" variant={field.value === "email" ? "default" : "outline"} onClick={() => { field.onChange("email"); form.setValue("value", ""); }}>{t("membersList.byEmail")}</Button>
                </div>
              </FormItem>
            )} />
            <FormField control={form.control} name="value" render={({ field }) => (
              <FormItem>
                <FormLabel>{form.watch("mode") === "email" ? t("membersList.emailLabel", { defaultValue: "Email address" }) : t("membersList.userIdLabel", { defaultValue: "User" })}</FormLabel>
                <FormControl>
                  {form.watch("mode") === "userId"
                    ? <UserSearchCombobox value={field.value} onChange={(userId) => field.onChange(userId)} />
                    : <Input placeholder={t("membersList.emailPlaceholder")} {...field} />}
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="isManager" render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <FormLabel>{t("membersList.manager")}</FormLabel>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )} />
            {form.watch("mode") === "email" && (
              <FormField control={form.control} name="expiresInDays" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("invitationsList.expiresInDays", { defaultValue: "Expires in (days)" })}</FormLabel>
                  <FormControl><Input type="number" min={1} max={30} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("membersList.cancel")}</Button>
              <Button type="submit" disabled={isPending}>{isPending ? t("membersList.adding") : t("membersList.addMember", { defaultValue: "Add Member" })}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

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

const addMemberSchema = z.object({
  value: z.string().min(1, "Required"),
  isManager: z.boolean(),
  expiresInDays: z.coerce.number().min(1).max(30).optional(),
  mode: z.enum(["userId", "email"]),
});
type AddMemberForm = z.infer<typeof addMemberSchema>;

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function AddMemberDialog({ open, onOpenChange, projectId }: AddMemberDialogProps) {
  const t = useTranslations("modules.projects.project.details");
  const { addMember, isPending } = useProjectMembers(projectId);

  const form = useForm<AddMemberForm>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { value: "", isManager: false, expiresInDays: 7, mode: "userId" },
  });

  async function handleSubmit(data: AddMemberForm) {
    await addMember({ [data.mode]: data.value, isManager: data.isManager, ...(data.mode === "email" ? { expiresInDays: data.expiresInDays } : {}) } as any);
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
                  <Button type="button" size="sm" variant={field.value === "userId" ? "default" : "outline"} onClick={() => { field.onChange("userId"); form.setValue("value", ""); }}>User</Button>
                  <Button type="button" size="sm" variant={field.value === "email" ? "default" : "outline"} onClick={() => { field.onChange("email"); form.setValue("value", ""); }}>Email</Button>
                </div>
              </FormItem>
            )} />
            <FormField control={form.control} name="value" render={({ field }) => (
              <FormItem>
                <FormLabel>{form.watch("mode") === "email" ? t("membersList.emailLabel", { defaultValue: "Email address" }) : t("membersList.userIdLabel", { defaultValue: "User" })}</FormLabel>
                <FormControl>
                  {form.watch("mode") === "userId"
                    ? <UserSearchCombobox value={field.value} onChange={(userId) => field.onChange(userId)} />
                    : <Input placeholder="user@example.com" {...field} />}
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending ? "Adding..." : t("membersList.addMember", { defaultValue: "Add Member" })}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

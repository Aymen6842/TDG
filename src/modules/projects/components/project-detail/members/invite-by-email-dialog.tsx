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
import useProjectInvitations from "../../../hooks/members/use-project-invitations";

const inviteSchema = z.object({
  email: z.string().email("Invalid email"),
  isManager: z.boolean(),
  expiresInDays: z.coerce.number().min(1).max(30).optional(),
});
type InviteForm = z.infer<typeof inviteSchema>;

interface InviteByEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function InviteByEmailDialog({ open, onOpenChange, projectId }: InviteByEmailDialogProps) {
  const t = useTranslations("modules.projects.project.details");
  const { createInvitation, isPending } = useProjectInvitations(projectId);

  const form = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", isManager: false, expiresInDays: 7 },
  });

  async function handleSubmit(data: InviteForm) {
    await createInvitation({ email: data.email, isManager: data.isManager, expiresInDays: data.expiresInDays });
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("membersList.invite")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("membersList.emailLabel", { defaultValue: "Email address" })}</FormLabel>
                <FormControl><Input placeholder="user@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="isManager" render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <FormLabel>{t("membersList.manager")}</FormLabel>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="expiresInDays" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("invitationsList.expiresInDays", { defaultValue: "Expires in (days)" })}</FormLabel>
                <FormControl><Input type="number" min={1} max={30} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending ? "Sending..." : t("membersList.invite")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

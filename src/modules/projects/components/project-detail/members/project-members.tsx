"use client";
import React from "react";
import { format } from "date-fns";
import { Plus, MoreHorizontal, User, Mail, Calendar, ShieldCheck, RefreshCw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { ProjectType } from "../../../types/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import useProjectMembers from "../../../hooks/members/use-project-members";
import useProjectInvitations from "../../../hooks/members/use-project-invitations";
import UserSearchCombobox from "./user-search-combobox";

interface Props {
  project: ProjectType;
}

const addMemberSchema = z.object({
  value: z.string().min(1, "Required"),
  isManager: z.boolean(),
  expiresInDays: z.coerce.number().min(1).max(30).optional(),
  mode: z.enum(["userId", "email"]),
});
type AddMemberForm = z.infer<typeof addMemberSchema>;

const inviteSchema = z.object({
  email: z.string().email("Invalid email"),
  isManager: z.boolean(),
  expiresInDays: z.coerce.number().min(1).max(30).optional(),
});
type InviteForm = z.infer<typeof inviteSchema>;

export default function ProjectMembers({ project }: Props) {
  const t = useTranslations("modules.projects.project.details");

  const members = project.members || [];
  const invitations = project.invitations || [];

  const { addMember, updateRole, removeMember, isPending: memberPending } = useProjectMembers(project.id);
  const { createInvitation, revokeInvitation, resendInvitation, isPending: invitePending } = useProjectInvitations(project.id);

  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);
  const [memberToRemove, setMemberToRemove] = React.useState<string | null>(null);
  const [inviteToRevoke, setInviteToRevoke] = React.useState<string | null>(null);

  const addForm = useForm<AddMemberForm>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { value: "", isManager: false, expiresInDays: 7, mode: "userId" },
  });

  const inviteForm = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", isManager: false, expiresInDays: 7 },
  });

  async function handleAddMember(data: AddMemberForm) {
    await addMember({
      [data.mode]: data.value,
      isManager: data.isManager,
      ...(data.mode === "email" ? { expiresInDays: data.expiresInDays } : {}),
    } as any);
    addForm.reset();
    setAddDialogOpen(false);
  }

  async function handleInvite(data: InviteForm) {
    await createInvitation({ email: data.email, isManager: data.isManager, expiresInDays: data.expiresInDays });
    inviteForm.reset();
    setInviteDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{t("membersList.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("membersList.description")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            {t("membersList.addMember", { defaultValue: "Add Member" })}
          </Button>
          <Button onClick={() => setInviteDialogOpen(true)}>
            <Mail className="mr-2 size-4" />
            {t("membersList.invite")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* ACTIVE MEMBERS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="size-5" />
              {t("membersList.title")} ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <p className="text-sm text-center py-6 text-muted-foreground">
                {t("membersList.empty", { defaultValue: "No active members." })}
              </p>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                          {(member.user?.name || member.userId).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-none">
                          {member.user?.name || member.userId}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="size-3" />
                          {t("membersList.joined")} {format(new Date(member.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.isManager ? "default" : "secondary"} className="text-[10px] h-5">
                        {member.isManager
                          ? <span className="flex items-center gap-1"><ShieldCheck className="size-3" /> {t("membersList.manager")}</span>
                          : t("membersList.member")}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => updateRole(member.id, { isManager: !member.isManager })}
                            disabled={memberPending}
                          >
                            <ShieldCheck className="size-4 mr-2" />
                            {member.isManager
                              ? t("membersList.demote", { defaultValue: "Remove Manager Role" })
                              : t("membersList.promote", { defaultValue: "Make Manager" })}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setMemberToRemove(member.id)}
                          >
                            <Trash2 className="size-4 mr-2" />
                            {t("membersList.remove")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PENDING INVITATIONS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="size-5" />
              {t("invitationsList.title")} ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invitations.length === 0 ? (
              <p className="text-sm text-center py-6 text-muted-foreground">
                {t("invitationsList.empty", { defaultValue: "No pending invitations." })}
              </p>
            ) : (
              <div className="space-y-3">
                {invitations.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                          {invite.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-none truncate max-w-[150px] sm:max-w-xs">
                          {invite.email}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="size-3" />
                          {t("invitationsList.expires")} {format(new Date(invite.expiresAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] h-5">
                        {invite.isManager ? t("membersList.manager") : t("membersList.member")}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => resendInvitation(invite.id)}
                            disabled={invitePending}
                          >
                            <RefreshCw className="size-4 mr-2" />
                            {t("invitationsList.resend", { defaultValue: "Resend" })}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setInviteToRevoke(invite.id)}
                          >
                            <Trash2 className="size-4 mr-2" />
                            {t("invitationsList.cancel")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("membersList.addMember", { defaultValue: "Add Member" })}</DialogTitle>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddMember)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("membersList.addBy", { defaultValue: "Add by" })}</FormLabel>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={field.value === "userId" ? "default" : "outline"}
                        onClick={() => { field.onChange("userId"); addForm.setValue("value", ""); }}
                      >
                        User
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={field.value === "email" ? "default" : "outline"}
                        onClick={() => { field.onChange("email"); addForm.setValue("value", ""); }}
                      >
                        Email
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {addForm.watch("mode") === "email"
                        ? t("membersList.emailLabel", { defaultValue: "Email address" })
                        : t("membersList.userIdLabel", { defaultValue: "User" })}
                    </FormLabel>
                    <FormControl>
                      {addForm.watch("mode") === "userId" ? (
                        <UserSearchCombobox
                          value={field.value}
                          onChange={(userId) => field.onChange(userId)}
                        />
                      ) : (
                        <Input placeholder="user@example.com" {...field} />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="isManager"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>{t("membersList.manager")}</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              {addForm.watch("mode") === "email" && (
                <FormField
                  control={addForm.control}
                  name="expiresInDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("invitationsList.expiresInDays", { defaultValue: "Expires in (days)" })}</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={30} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={memberPending}>
                  {memberPending ? "Adding..." : t("membersList.addMember", { defaultValue: "Add Member" })}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Invite by Email Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("membersList.invite")}</DialogTitle>
          </DialogHeader>
          <Form {...inviteForm}>
            <form onSubmit={inviteForm.handleSubmit(handleInvite)} className="space-y-4">
              <FormField
                control={inviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("membersList.emailLabel", { defaultValue: "Email address" })}</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={inviteForm.control}
                name="isManager"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>{t("membersList.manager")}</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={inviteForm.control}
                name="expiresInDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("invitationsList.expiresInDays", { defaultValue: "Expires in (days)" })}</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={30} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={invitePending}>
                  {invitePending ? "Sending..." : t("membersList.invite")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!memberToRemove} onOpenChange={(o) => !o && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("membersList.removeTitle", { defaultValue: "Remove Member" })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("membersList.removeDescription", { defaultValue: "Are you sure you want to remove this member from the project?" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (memberToRemove) { removeMember(memberToRemove); setMemberToRemove(null); } }}
            >
              {t("membersList.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke Invitation Confirmation */}
      <AlertDialog open={!!inviteToRevoke} onOpenChange={(o) => !o && setInviteToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("invitationsList.revokeTitle", { defaultValue: "Revoke Invitation" })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("invitationsList.revokeDescription", { defaultValue: "Are you sure you want to revoke this invitation?" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (inviteToRevoke) { revokeInvitation(inviteToRevoke); setInviteToRevoke(null); } }}
            >
              {t("invitationsList.cancel")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

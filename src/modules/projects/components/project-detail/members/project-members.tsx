"use client";
import React from "react";
import { Plus, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ProjectType } from "../../../types/projects";
import { SectionHeader } from "../../shared/section-header";
import { ConfirmDialog } from "../../shared/confirm-dialog";
import { MembersListCard } from "./members-list-card";
import { InvitationsListCard } from "./invitations-list-card";
import { AddMemberDialog } from "./add-member-dialog";
import { InviteByEmailDialog } from "./invite-by-email-dialog";
import useProjectMembers from "../../../hooks/members/use-project-members";
import useProjectInvitations from "../../../hooks/members/use-project-invitations";

interface Props {
  project: ProjectType;
}

export default function ProjectMembers({ project }: Props) {
  const t = useTranslations("modules.projects.project.details");
  const members = project.members || [];
  const invitations = project.invitations || [];

  const { updateRole, removeMember, isPending: memberPending } = useProjectMembers(project.id);
  const { revokeInvitation, resendInvitation, isPending: invitePending } = useProjectInvitations(project.id);

  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);
  const [memberToRemove, setMemberToRemove] = React.useState<string | null>(null);
  const [inviteToRevoke, setInviteToRevoke] = React.useState<string | null>(null);

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t("membersList.title")}
        description={t("membersList.description")}
        actions={
          <>
            <Button variant="outline" onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              {t("membersList.addMember", { defaultValue: "Add Member" })}
            </Button>
            <Button onClick={() => setInviteDialogOpen(true)}>
              <Mail className="mr-2 size-4" />
              {t("membersList.invite")}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <MembersListCard members={members} onUpdateRole={updateRole} onRemoveMember={setMemberToRemove} isPending={memberPending} />
        <InvitationsListCard invitations={invitations} onResend={resendInvitation} onRevoke={setInviteToRevoke} isPending={invitePending} />
      </div>

      <AddMemberDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} projectId={project.id} />
      <InviteByEmailDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} projectId={project.id} />

      <ConfirmDialog
        open={!!memberToRemove}
        onOpenChange={(o) => !o && setMemberToRemove(null)}
        title={t("membersList.removeTitle", { defaultValue: "Remove Member" })}
        description={t("membersList.removeDescription", { defaultValue: "Are you sure you want to remove this member from the project?" })}
        onConfirm={() => { if (memberToRemove) { removeMember(memberToRemove); setMemberToRemove(null); } }}
        onCancel={() => setMemberToRemove(null)}
        confirmLabel={t("membersList.remove")}
      />

      <ConfirmDialog
        open={!!inviteToRevoke}
        onOpenChange={(o) => !o && setInviteToRevoke(null)}
        title={t("invitationsList.revokeTitle", { defaultValue: "Revoke Invitation" })}
        description={t("invitationsList.revokeDescription", { defaultValue: "Are you sure you want to revoke this invitation?" })}
        onConfirm={() => { if (inviteToRevoke) { revokeInvitation(inviteToRevoke); setInviteToRevoke(null); } }}
        onCancel={() => setInviteToRevoke(null)}
        confirmLabel={t("invitationsList.cancel")}
      />
    </div>
  );
}

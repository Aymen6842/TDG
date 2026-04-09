import { format } from "date-fns";
import { Calendar, Mail, MoreHorizontal, RefreshCw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListCard } from "../../shared/list-card";
import { ProjectInvitation as ProjectInvitationType } from "../../../types/projects";

interface InvitationsListCardProps {
  invitations: ProjectInvitationType[];
  onResend: (invitationId: string) => void;
  onRevoke: (invitationId: string) => void;
  isPending: boolean;
}

export function InvitationsListCard({ invitations, onResend, onRevoke, isPending }: InvitationsListCardProps) {
  const t = useTranslations("modules.projects.project.details");

  return (
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
              <ListCard
                key={invite.id}
                avatar={
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                      {invite.email.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                }
                primary={invite.email}
                secondary={
                  <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="size-3" />
                    {t("invitationsList.expires")} {format(new Date(invite.expiresAt), "MMM d, yyyy")}
                  </span>
                }
                badge={
                  <Badge variant="outline" className="text-[10px] h-5">
                    {invite.isManager ? t("membersList.manager") : t("membersList.member")}
                  </Badge>
                }
                actions={
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onResend(invite.id)} disabled={isPending}>
                        <RefreshCw className="size-4 mr-2" />
                        {t("invitationsList.resend", { defaultValue: "Resend" })}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => onRevoke(invite.id)}>
                        <Trash2 className="size-4 mr-2" />
                        {t("invitationsList.cancel")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                }
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

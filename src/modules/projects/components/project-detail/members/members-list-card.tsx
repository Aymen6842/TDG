import { format } from "date-fns";
import { Calendar, ShieldCheck, MoreHorizontal, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import { ListCard } from "../../shared/list-card";
import { ProjectMember as ProjectMemberType } from "../../../types/projects";

interface MembersListCardProps {
  members: ProjectMemberType[];
  onUpdateRole: (memberId: string, data: { isManager: boolean }) => void;
  onRemoveMember: (memberId: string) => void;
  isPending: boolean;
}

export function MembersListCard({ members, onUpdateRole, onRemoveMember, isPending }: MembersListCardProps) {
  const t = useTranslations("modules.projects.project.details");

  return (
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
              <ListCard
                key={member.id}
                avatar={
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                      {(member.user?.name || member.userId).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                }
                primary={member.user?.name || member.userId}
                secondary={
                  <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="size-3" />
                    {t("membersList.joined")} {format(new Date(member.createdAt), "MMM d, yyyy")}
                  </span>
                }
                badge={
                  <Badge variant={member.isManager ? "default" : "secondary"} className="text-[10px] h-5">
                    {member.isManager
                      ? <span className="flex items-center gap-1"><ShieldCheck className="size-3" /> {t("membersList.manager")}</span>
                      : t("membersList.member")}
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
                      <DropdownMenuItem onClick={() => onUpdateRole(member.id, { isManager: !member.isManager })} disabled={isPending}>
                        <ShieldCheck className="size-4 mr-2" />
                        {member.isManager ? t("membersList.demote", { defaultValue: "Remove Manager Role" }) : t("membersList.promote", { defaultValue: "Make Manager" })}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => onRemoveMember(member.id)}>
                        <Trash2 className="size-4 mr-2" />
                        {t("membersList.remove")}
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

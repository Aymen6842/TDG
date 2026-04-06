"use client";
import React from "react";
import { format } from "date-fns";
import { Plus, MoreHorizontal, User, Mail, Calendar, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { ProjectType } from "../../../types/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Props {
  project: ProjectType;
}

export default function ProjectMembers({ project }: Props) {
  const t = useTranslations("modules.projects.project.details");
  
  const members = project.members || [];
  const invitations = project.invitations || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-semibold tracking-tight">{t("membersList.title")}</h2>
           <p className="text-sm text-muted-foreground">{t("membersList.description")}</p>
        </div>
        <Button>
          <Plus className="mr-2 size-4" />
          {t("membersList.invite")}
        </Button>
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
               <p className="text-sm text-center py-6 text-muted-foreground">No active members.</p>
            ) : (
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                     <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                           <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                             {member.userId.substring(0, 2).toUpperCase()}
                           </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                           <span className="text-sm font-medium leading-none">{member.userId}</span>
                           <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                             <Calendar className="size-3" />
                             {t("membersList.joined")} {format(new Date(member.createdAt), "MMM d, yyyy")}
                           </span>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <Badge variant={member.isManager ? "default" : "secondary"} className="text-[10px] h-5">
                          {member.isManager ? (
                            <span className="flex items-center gap-1"><ShieldCheck className="size-3"/> {t("membersList.manager")}</span>
                          ) : t("membersList.member")}
                        </Badge>
                        <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="size-8">
                               <MoreHorizontal className="size-4" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                             <DropdownMenuItem className="text-destructive">
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
               <p className="text-sm text-center py-6 text-muted-foreground">No pending invitations.</p>
            ) : (
              <div className="space-y-4">
                {invitations.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                     <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                           <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                             {invite.email.substring(0, 2).toUpperCase()}
                           </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                           <span className="text-sm font-medium leading-none truncate max-w-[150px] sm:max-w-xs">{invite.email}</span>
                           <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                             <Calendar className="size-3" />
                             {t("invitationsList.expires")} {format(new Date(invite.expiresAt), "MMM d")}
                           </span>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
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
                             <DropdownMenuItem className="text-destructive">
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
    </div>
  );
}

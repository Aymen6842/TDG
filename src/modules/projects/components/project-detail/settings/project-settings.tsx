"use client";
import React from "react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { 
  Briefcase, 
  Settings, 
  Calendar, 
  CreditCard, 
  Archive, 
  LayoutTemplate,
  AlignLeft,
  CircleDot
} from "lucide-react";

import { ProjectType } from "../../../types/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface Props {
  project: ProjectType;
}

export default function ProjectSettings({ project }: Props) {
  const t = useTranslations("modules.projects.project.details.settings");
  
  // name and description are mapped from contents[0] during casting
  const projectName = project.name;
  const projectDesc = project.description || "No description provided.";

  return (
    <div className="space-y-6">
      <div>
         <h2 className="text-xl font-semibold tracking-tight">{t("title")}</h2>
         <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         {/* General Information */}
        <Card>
          <CardHeader>
             <CardTitle className="text-lg flex items-center gap-2">
               <Settings className="size-5" />
               {t("general")}
             </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
             <div className="space-y-1.5">
               <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                 <AlignLeft className="size-3.5"/> {t("name")}
               </Label>
               <p className="text-sm font-medium leading-relaxed">{projectName}</p>
             </div>
             
             <div className="space-y-1.5">
               <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                 <AlignLeft className="size-3.5"/> {t("desc")}
               </Label>
               <p className="text-sm leading-relaxed">{projectDesc}</p>
             </div>

             <div className="space-y-1.5">
               <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                 <Briefcase className="size-3.5"/> {t("businessUnit")}
               </Label>
               <p className="text-sm font-medium leading-relaxed">{project.businessUnit}</p>
             </div>

             <div className="space-y-1.5">
               <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                 <LayoutTemplate className="size-3.5"/> {t("type")}
               </Label>
               <div className="mt-1">
                 <Badge variant="outline" className="font-mono text-xs shadow-sm">
                   {project.projectType}
                 </Badge>
               </div>
             </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Status & Payment */}
          <Card>
            <CardHeader>
               <CardTitle className="text-lg flex items-center gap-2">
                 <CircleDot className="size-5" />
                 {t("status")}
               </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="size-4 text-muted-foreground" />
                  <span>{t("paid")}</span>
                </div>
                <Badge variant={project.paid ? "default" : "secondary"}>
                  {project.paid ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Archive className="size-4 text-muted-foreground" />
                  <span>{t("archived")}</span>
                </div>
                <Badge variant={project.isArchived ? "destructive" : "secondary"}>
                  {project.isArchived ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between pt-3 border-t mt-1">
                 <span className="text-sm font-medium text-muted-foreground">Lifecycle Status</span>
                 <Badge variant="outline" className="capitalize text-xs">{project.status.toLowerCase()}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
               <CardTitle className="text-lg flex items-center gap-2">
                 <Calendar className="size-5" />
                 {t("timeline")}
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Start Date</span>
                <span className="font-semibold">{format(project.startTime, "MMMM d, yyyy")}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">End Date</span>
                <span className="font-semibold">{format(project.endTime, "MMMM d, yyyy")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

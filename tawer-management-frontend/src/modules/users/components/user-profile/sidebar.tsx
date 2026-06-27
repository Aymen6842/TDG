"use client";
import { Mail, TrendingUp, Users, Phone } from "lucide-react";
import { useLanguages } from "@/hooks/use-languages";
import { useTranslations } from "next-intl";
import type { UserType } from "../../types/users";
import useUserRoles from "@/modules/auth/hooks/users/roles";
import { castRoleFromBackendToFrontend } from "@/modules/auth/utils/user-roles";

interface Props {
  user: UserType;
}

export function ProfileSidebar({ user }: Props) {
  const t = useTranslations("modules.users.profile");
  const { currentLanguage } = useLanguages();
  const { roles } = useUserRoles();

  return (
    <div className="space-y-10">
      <div className="space-y-8">
        {/* About Section */}
        <div className="space-y-6">
          <h3 className="text-muted-foreground text-[10px] font-black tracking-[0.2em] uppercase">
            {t("about")}
          </h3>
          <div className="space-y-5">
            <div className="group flex items-center gap-4 text-sm">
              <div className="bg-muted border-border group-hover:border-primary/30 flex h-10 w-10 items-center justify-center rounded-xl border transition-colors">
                <Users className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
              </div>
              <span className="text-foreground font-bold tracking-tight">{user.name}</span>
            </div>

            {user.roles?.map((userRole) => (
              <div key={userRole} className="group flex items-center gap-4 text-sm">
                <div className="bg-muted border-border group-hover:border-primary/30 flex h-10 w-10 items-center justify-center rounded-xl border transition-colors">
                  <TrendingUp className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                </div>
                <span className="text-muted-foreground group-hover:text-foreground font-medium transition-colors">
                  {roles
                    ? roles.find((role) => castRoleFromBackendToFrontend(role.value) === userRole)
                        ?.label
                    : userRole}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="space-y-6">
          <h3 className="text-muted-foreground text-[10px] font-black tracking-[0.2em] uppercase">
            {t("contacts")}
          </h3>
          <div className="space-y-5">
            <div className="group flex items-center gap-4 text-sm">
              <div className="bg-muted border-border group-hover:border-primary/30 flex h-10 w-10 items-center justify-center rounded-xl border transition-colors">
                <Mail className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
              </div>
              <span className="text-muted-foreground group-hover:text-foreground truncate font-medium transition-colors">
                {user.email}
              </span>
            </div>
            {user.phone && (
              <div className="group flex items-center gap-4 text-sm">
                <div className="bg-muted border-border group-hover:border-primary/30 flex h-10 w-10 items-center justify-center rounded-xl border transition-colors">
                  <Phone className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                </div>
                <span className="text-muted-foreground group-hover:text-foreground font-medium transition-colors">
                  {user.phone}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

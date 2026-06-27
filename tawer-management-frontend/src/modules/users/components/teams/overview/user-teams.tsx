import { UsersIcon, BadgeDollarSignIcon, ContainerIcon, PaletteIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import useUserInfo from "@/modules/users/hooks/extraction/use-user";

const teams = [
  { id: "1", icon: UsersIcon, name: "#digitalmarketing", members: 8 },
  { id: "2", icon: BadgeDollarSignIcon, name: "#ethereum", members: 14 },
  { id: "3", icon: ContainerIcon, name: "#conference", members: 3 },
  { id: "4", icon: PaletteIcon, name: "#supportteam", members: 3 }
];

interface Props {
  id: string;
}

export default function UserTeams({ id }: Props) {
  const t = useTranslations("modules.users.teams");

  const { user, userIsLoading, userError } = useUserInfo({ id });

  return (
    user && (
      <div className="">
        <Card className="overflow-hidden pb-5">
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center gap-4">
                <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                  {team.icon && <team.icon className="size-5" />}
                </div>

                <div className="flex-1">
                  <p className="font-medium">{team.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {t("members", { count: user.teams.length })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  );
}

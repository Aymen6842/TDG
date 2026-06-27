import { castRoleFromBackendToFrontend } from "@/modules/auth/utils/user-roles";
import { TeamInResponseType, TeamType } from "@/modules/users/types/teams";

export function castToTeamType(team: TeamInResponseType): TeamType {
  return {
    id: team.id,
    name: team.name,
    members: team.members.map((member) => ({
      id: member.id,
      isManager: member.isManager,
      image: `${process.env.BACKEND_ADDRESS}${member.image}`,
      name: member.name,
      email: member.email,
      phone: member.phone,
      roles: member.roles.map((role) => castRoleFromBackendToFrontend(role))
    }))
  };
}

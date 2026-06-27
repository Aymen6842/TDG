import { UploadedTeamType } from "@/modules/users/types/teams";
import { TeamFormSchema } from "../../../validation/schemas/team.schema";

/**
 * Cleans and converts team object conforming to TeamFormSchema into a FormData object.
 * This is necessary for uploading to clean unused data and make sure we submit data that backend is waiting for
 *
 * @param data - The team object to convert.
 * @returns A new FormData object.
 */
export function cleanTeamDataToUpload(data: TeamFormSchema): UploadedTeamType {
  const team: UploadedTeamType = {
    name: data.name,
    members: [] as { userId: string; isManager: boolean }[]
  };

  data.members.forEach((member) => {
    team.members.push({
      userId: member,
      isManager: false
    });
  });

  team.members.push({
    userId: data.manager,
    isManager: true
  });

  return team;
}

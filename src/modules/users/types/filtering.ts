import { UserRoleOnFrontendSide } from "@/modules/auth/types";
import { UserType } from "./users";

export type UsersCriteriaType =
  | "emailAsc"
  | "emailDesc"
  | "nameAsc"
  | "nameDesc"
  | "workedHoursAsc"
  | "workedHoursDesc"
  | "workedProjectsAsc"
  | "workedProjectsDesc"
  | "avgSessionAsc"
  | "avgSessionDesc"
  | "createdAtAsc"
  | "createdAtDesc";

export type SearchUserByType = "name" | "email" | "phone";

export interface FilteringUsersHookResult {
  users: UserType[] | undefined | null; // replace `any` with your User type
  usersAreLoading: boolean;
  usersError: boolean;
  setPage: (page: number) => void;
  page: number;
  pagesNumber: number;
  records: number;
  filterVersion: number;

  searchByState: [SearchUserByType, (value: SearchUserByType) => void];
  searchState: [string, (value: string) => void];

  rolesState: [UserRoleOnFrontendSide[], (value: UserRoleOnFrontendSide[]) => void];
  criteriaState: [UsersCriteriaType, (value: UsersCriteriaType) => void];
  usersCreationPeriodState: [
    { from: string; to: string },
    (range: { from: string; to: string }) => void
  ];

  applyFilter: () => void;
  exportIsPending: boolean;
}

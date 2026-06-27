import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterPanel } from "./shared/filter-panel";
import { FilterSection } from "./shared/filter-section";
import { BusinessUnit, ProjectTypeEnum } from "../types/projects";

interface ProjectCreator {
  id: string;
  name: string;
}

interface ProjectsFilterPanelProps {
  sortBy: string | undefined;
  setSortBy: (v: string | undefined) => void;
  projectType: ProjectTypeEnum | undefined;
  setProjectType: (v: ProjectTypeEnum | undefined) => void;
  businessUnit: BusinessUnit | undefined;
  setBusinessUnit: (v: BusinessUnit | undefined) => void;
  isArchived: boolean | undefined;
  setIsArchived: (v: boolean | undefined) => void;
  paid: boolean | undefined;
  setPaid: (v: boolean | undefined) => void;
  createdById: string | undefined;
  setCreatedById: (v: string | undefined) => void;
  currentUserId: string | undefined;
  creators: ProjectCreator[];
  onClear: () => void;
}

export function ProjectsFilterPanel({
  sortBy, setSortBy,
  projectType, setProjectType,
  businessUnit, setBusinessUnit,
  isArchived, setIsArchived,
  paid, setPaid,
  createdById, setCreatedById,
  currentUserId, creators,
  onClear,
}: ProjectsFilterPanelProps) {
  const t = useTranslations("modules.projects.list");

  const hasActiveFilters = !!(projectType || businessUnit || isArchived === true || paid !== undefined || sortBy || createdById);

  return (
    <FilterPanel hasActiveFilters={hasActiveFilters} onClear={onClear}>
      <FilterSection label={t("filters.sortBy", { defaultValue: "Sort By" })}>
        <Select value={sortBy ?? "default"} onValueChange={(v) => setSortBy(v === "default" ? undefined : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("filters.selectSortOption", { defaultValue: "Select sorting option" })} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">{t("filters.defaultOrder", { defaultValue: "Default" })}</SelectItem>
            <SelectItem value="displayOrderAsc">{t("filters.displayOrder", { defaultValue: "Display Order" })}</SelectItem>
            <SelectItem value="startDateAsc">{t("filters.startDateAscending", { defaultValue: "Start Date (Oldest)" })}</SelectItem>
            <SelectItem value="startDateDesc">{t("filters.startDateDescending", { defaultValue: "Start Date (Newest)" })}</SelectItem>
            <SelectItem value="estimatedStartDateAsc">{t("filters.estimatedStartAsc", { defaultValue: "Est. Start (Oldest)" })}</SelectItem>
            <SelectItem value="estimatedStartDateDesc">{t("filters.estimatedStartDesc", { defaultValue: "Est. Start (Newest)" })}</SelectItem>
            <SelectItem value="estimatedEndDateAsc">{t("filters.estimatedEndAsc", { defaultValue: "Est. End (Oldest)" })}</SelectItem>
            <SelectItem value="estimatedEndDateDesc">{t("filters.estimatedEndDesc", { defaultValue: "Est. End (Newest)" })}</SelectItem>
            <SelectItem value="createdAtAsc">{t("filters.createdAtAscending", { defaultValue: "Created (Oldest)" })}</SelectItem>
            <SelectItem value="createdAtDesc">{t("filters.createdAtDescending", { defaultValue: "Created (Newest)" })}</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection label={t("filters.projectType", { defaultValue: "Project Type" })}>
        <Select value={projectType || "all"} onValueChange={(v) => setProjectType(v === "all" ? undefined : v as ProjectTypeEnum)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("filters.allTypes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
            <SelectItem value="AGILE">{t("filters.agile")}</SelectItem>
            <SelectItem value="FREESTYLE">{t("filters.freestyle")}</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection label={t("filters.businessUnit", { defaultValue: "Business Unit" })}>
        <Select value={businessUnit || "all"} onValueChange={(v) => setBusinessUnit(v === "all" ? undefined : v as BusinessUnit)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("filters.allUnits")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allUnits")}</SelectItem>
            <SelectItem value="TawerDev">{t("filters.tawerDev")}</SelectItem>
            <SelectItem value="TawerCreative">{t("filters.tawerCreative")}</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>

      <div className="grid grid-cols-2 gap-4">
        <FilterSection label={t("filters.isArchived", { defaultValue: "Archived" })}>
          <Select
            value={isArchived === undefined ? "all" : isArchived ? "true" : "false"}
            onValueChange={(v) => setIsArchived(v === "all" ? undefined : v === "true")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("filters.all")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.all")}</SelectItem>
              <SelectItem value="true">{t("filters.archived")}</SelectItem>
              <SelectItem value="false">{t("filters.active")}</SelectItem>
            </SelectContent>
          </Select>
        </FilterSection>

        <FilterSection label={t("filters.paid", { defaultValue: "Paid" })}>
          <Select
            value={paid === undefined ? "all" : paid ? "true" : "false"}
            onValueChange={(v) => setPaid(v === "all" ? undefined : v === "true")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("filters.all")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.all")}</SelectItem>
              <SelectItem value="true">{t("filters.paid")}</SelectItem>
              <SelectItem value="false">{t("filters.free")}</SelectItem>
            </SelectContent>
          </Select>
        </FilterSection>
      </div>

      <FilterSection label={t("filters.createdBy", { defaultValue: "Created By" })}>
        <Select value={createdById || "all"} onValueChange={(v) => setCreatedById(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("filters.allCreators", { defaultValue: "All creators" })} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allCreators", { defaultValue: "All creators" })}</SelectItem>
            {currentUserId && (
              <SelectItem value={currentUserId}>
                {t("filters.createdByMe", { defaultValue: "Created by me" })}
              </SelectItem>
            )}
            {creators
              .filter(c => c.id !== currentUserId)
              .map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
          </SelectContent>
        </Select>
      </FilterSection>
    </FilterPanel>
  );
}

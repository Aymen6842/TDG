import React from "react";
import { Search, SlidersHorizontal, ListIcon, GridIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ToolbarProps {
  tabs?: React.ReactNode;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterContent?: React.ReactNode;
  activeFilterCount?: number;
  viewMode?: "list" | "grid";
  onViewModeChange?: (mode: "list" | "grid") => void;
  actions?: React.ReactNode;
}

export function Toolbar({
  tabs,
  search,
  onSearchChange,
  searchPlaceholder,
  filterContent,
  activeFilterCount = 0,
  viewMode,
  onViewModeChange,
  actions,
}: ToolbarProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
      {tabs && <div>{tabs}</div>}

      <div className="flex w-full items-center gap-2 lg:w-auto">
        <div className="relative w-auto">
          <Search className="absolute top-2.5 left-3 size-4 opacity-50" />
          <Input
            placeholder={searchPlaceholder}
            className="ps-10"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {filterContent && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="relative">
                <SlidersHorizontal />
                {activeFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -end-1.5 -top-1.5 size-4 rounded-full p-0 flex items-center justify-center text-[10px]"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              {filterContent}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {viewMode !== undefined && onViewModeChange && (
          <ToggleGroup
            type="single"
            variant="outline"
            value={viewMode}
            onValueChange={(value) => value && onViewModeChange(value as "list" | "grid")}
          >
            <ToggleGroupItem value="list" aria-label="List view">
              <ListIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <GridIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        )}

        {actions}
      </div>
    </div>
  );
}

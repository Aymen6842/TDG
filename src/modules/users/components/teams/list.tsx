"use client";
import {
  ColumnDef,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable
} from "@tanstack/react-table";
import { ColumnsIcon, MoreHorizontal, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import useElementsDeletion from "@/hooks/use-elements-deletion";
import DeletionConfirmationDialog from "@/modules/users/components/deletion/deletion-confirmation-dialog";
import useTeams from "../../hooks/extraction/use-teams";
import { TeamType } from "../../types/teams";
import React from "react";
import UploadTeamDialog from "./upload";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import UserProfileImage from "../profile-image";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";

export default function TeamsList() {
  const t = useTranslations("modules.users.teams");
  const paginationContent = useTranslations("shared.pagination");
  const { teams, teamsAreLoading, setPage, page, records, pagesNumber, search, setSearch } =
    useTeams({ limit: 10 });
  const { user } = useCurrentUser();

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [teamToUpdate, setTeamToUpdate] = React.useState<TeamType | null>(null);

  const {
    onDelete,
    alertModalIsOpen,
    cancelDeletion,
    deleteAllElements,
    isPending,
    removeElementDirectlyWithoutElementsSelection,
    addElementToDeletionList
  } = useElementsDeletion("team");

  const columns: ColumnDef<TeamType>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => {
            row.toggleSelected(!!v);
            addElementToDeletionList(row.original.id);
          }}
        />
      )
    },
    {
      accessorKey: "name",
      header: t("table.headers.name"),
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>
    },
    {
      id: "members",
      header: t("table.headers.members"),
      cell: ({ row }) => {
        const members = row.original.members;

        if (!members?.length) return "-";

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                {members.length}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-64 p-3">
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <UserProfileImage name={member.name} image={member.image} />

                    <span className="text-sm font-medium">{member.name}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        );
      }
    },
    {
      id: "managers",
      header: t("table.headers.managers"),
      cell: ({ row }) => {
        const managers = row.original.members.filter((m) => m.isManager);
        return (
          <div className="flex flex-wrap gap-1">
            {managers.map((m) => (
              <Badge key={m.id} variant="success">
                {m.name}
              </Badge>
            ))}
          </div>
        );
      }
    },
    {
      id: "actions",
      header: t("table.headers.actions"),
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user && hasPermissions(user.roles, "teamsManagement", "edit") && (
              <DropdownMenuItem onClick={() => setTeamToUpdate(row.original)}>
                {t("table.actions.edit")}
              </DropdownMenuItem>
            )}
            {user && hasPermissions(user.roles, "teamsManagement", "delete") && (
              <DropdownMenuItem
                onSelect={() => removeElementDirectlyWithoutElementsSelection(row.original.id)}
                className="text-destructive">
                {t("table.actions.delete")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const table = useReactTable({
    data: teams ?? [],
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: page - 1,
        pageSize: 10
      }
    },
    manualPagination: true,
    pageCount: pagesNumber
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex justify-between gap-2">
          <Input
            placeholder={t("table.filters.search.placeholder")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="ms-auto flex gap-2">
          <div className="flex gap-2">
            {user &&
              hasPermissions(user.roles, "teamsManagement", "delete") &&
              table.getSelectedRowModel().rows.length > 0 && (
                <Button variant="destructive" onClick={() => onDelete()}>
                  <Trash2Icon />
                </Button>
              )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <span className="hidden lg:inline">{t("table.filters.columns")}</span>
                  <ColumnsIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead key={h.id}>
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {teamsAreLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                {t("table.loading")}
              </TableCell>
            </TableRow>
          ) : teams?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {t("table.noResults")}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-end space-x-2">
        <div className="text-muted-foreground flex-1 text-sm">
          {paginationContent.rich("selected", {
            page: page,
            pages: records,
            records: records
          })}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.previousPage();
              setPage(page - 1);
            }}
            disabled={!table.getCanPreviousPage()}>
            {paginationContent("previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.nextPage();
              setPage(page + 1);
            }}
            disabled={!table.getCanNextPage()}>
            {paginationContent("next")}
          </Button>
        </div>
      </div>

      {user && hasPermissions(user.roles, "teamsManagement", "delete") && (
        <DeletionConfirmationDialog
          isOpen={alertModalIsOpen}
          onOpenChange={cancelDeletion}
          title={t("deletion.title")}
          description={t("deletion.description")}
          onCancel={cancelDeletion}
          onConfirm={deleteAllElements}
          isPending={isPending}
        />
      )}

      {user && hasPermissions(user.roles, "teamsManagement", "edit") && teamToUpdate && (
        <UploadTeamDialog
          team={teamToUpdate}
          onClose={() => setTeamToUpdate(null)}
          triggerOpenning={teamToUpdate != null}
          triggerButtonIsUsed={false}
        />
      )}
    </div>
  );
}

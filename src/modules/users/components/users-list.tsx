"use client";;
import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ColumnsIcon,
  FilterIcon,
  MoreHorizontal,
  PlusCircle,
  Trash2Icon,
  ChevronUp,
  ChevronDown,
  Bell,
  Send,
  Mail,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { UserType } from "@/modules/users/types/users";
import useUsers from "@/modules/users/hooks/extraction/use-users";
import { useDebounce } from "@/hooks/use-debounce";
import useElementsDeletion from "@/hooks/use-elements-deletion";
import DeletionConfirmationDialog from "@/modules/users/components/deletion/deletion-confirmation-dialog";
import { UsersCriteriaType } from "@/modules/users/types/filtering";
import UploadUserDialog from "./upload";
import useUserRoles from "@/modules/auth/hooks/users/roles";
import { castRoleFromBackendToFrontend } from "@/modules/auth/utils/user-roles";
import { formatTimeSpentFromMinutesToHours } from "@/utils/format-time";
import UserProfileImage from "./profile-image";
import { useRouter } from "next/navigation";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import useCopy from "@/hooks/use-copy";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function UsersList() {
  const t = useTranslations("modules.users");
  const locale = useLocale();
  const router = useRouter();

  const paginationContent = useTranslations("shared.pagination");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchInput, setSearchInput] = React.useState("");
  const [userToUpdate, setUserToUpdate] = React.useState<UserType | null>(null);
  const {
    users,
    usersAreLoading,
    searchState: [search, setSearch],
    searchByState: [searchBy, setSearchBy],
    rolesState: [selectedRoles, setSelectedRoles],
    criteriaState: [criteria, setCriteria],
    applyFilter,
    setPage,
    page,
    pagesNumber,
    records
  } = useUsers({ limit: 10 });
  const { roles } = useUserRoles();
  const { user } = useCurrentUser();
  const { copied, copyToClipboard } = useCopy()

  const {
    isPending: isDeletionPending,
    addElementToDeletionList: addUserToDeletionList,
    removeElementFromDeletionList: removeUserFromDeletionList,
    removeElementDirectlyWithoutElementsSelection: removeUserWithoutSelection,
    alertModalIsOpen,
    cancelDeletion,
    deleteAllElements,
    onDelete,
    warning
  } = useElementsDeletion("user");

  const columns: ColumnDef<UserType>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            if (row.getIsSelected()) removeUserFromDeletionList(row.original.id);
            else addUserToDeletionList(row.original.id);
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        const mapping = sortMapping["name"];
        const isSorted = mapping
          ? criteria === mapping.asc
            ? "asc"
            : criteria === mapping.desc
              ? "desc"
              : false
          : false;
        const Icon =
          isSorted === "asc" ? ChevronUp : isSorted === "desc" ? ChevronDown : ArrowUpDown;
        return (
          <Button
            className="-ml-3"
            variant="ghost"
            onClick={() => {
              if (mapping) {
                setCriteria(criteria === mapping.asc ? mapping.desc : mapping.asc);
              }
            }}>
            {t("table.headers.name")}
            <Icon className="size-3" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <UserProfileImage
            name={row.original.name}
            image={row.original.image}
            isOnline={row.original.isOnline}
            size="sm"
          />
          <span>{row.original.name}</span>
        </div>
      )
    },

    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        const mapping = sortMapping["createdAt"];
        const isSorted = mapping
          ? criteria === mapping.asc
            ? "asc"
            : criteria === mapping.desc
              ? "desc"
              : false
          : false;
        const Icon =
          isSorted === "asc" ? ChevronUp : isSorted === "desc" ? ChevronDown : ArrowUpDown;
        return (
          <Button
            className="-ml-3"
            variant="ghost"
            onClick={() => {
              if (mapping) {
                setCriteria(criteria === mapping.asc ? mapping.desc : mapping.asc);
              }
            }}>
            {t("table.headers.createdAt")}
            <Icon className="size-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <div>{date.toLocaleDateString(locale, {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}</div>;
      }
    },
    // {
    //   accessorKey: "performance",
    //   header: () => t("table.headers.performance"),
    //   cell: ({ row }) => {
    //     const performance = row.original.performance ?? 0;
    //     return (
    //       <div className="w-28">
    //         <Progress value={20} />
    //       </div>
    //     );
    //   }
    // },
    {
      accessorKey: "averageSessionTimeInMinutes",
      header: () => t("table.headers.avgSession"),
      cell: ({ row }) => {
        const minutes = row.original.averageSessionTimeInMinutes;
        return minutes ? <div>{formatTimeSpentFromMinutesToHours(minutes)}</div> : "-";
      }
    },
    {
      accessorKey: "averageDailyMood",
      header: () => t("table.headers.avgDailyMood"),
      cell: ({ row }) => {
        return row.original.averageDailyMood ? <div>{row.original.averageDailyMood}</div> : "-";
      }
    },
    {
      accessorKey: "averagePerformanceRating",
      header: () => t("table.headers.avgPerformanceRating"),
      cell: ({ row }) => {
        return row.original.averagePerformanceRating ? (
          <div>{row.original.averagePerformanceRating}</div>
        ) : (
          "-"
        );
      }
    },

    {
      id: "notifications",
      header: () => t("table.headers.notifications"),
      cell: ({ row }) => {
        const { notificationsSettings } = row.original;

        return (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              {/* Email */}
              <Tooltip>
                <TooltipTrigger>
                  <Mail
                    className={cn(
                      "size-4",
                      notificationsSettings.emailNotifications
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {notificationsSettings.emailNotifications
                    ? t("table.notifications.email.enabled")
                    : t("table.notifications.email.disabled")}
                </TooltipContent>
              </Tooltip>

              {/* Telegram */}
              <Tooltip>
                <TooltipTrigger>
                  <Send
                    className={cn(
                      "size-4",
                      notificationsSettings.telegramNotifications
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {notificationsSettings.telegramNotifications
                    ? t("table.notifications.telegram.enabled")
                    : t("table.notifications.telegram.disabled")}
                </TooltipContent>
              </Tooltip>

              {/* NTFY */}
              <Tooltip>
                <TooltipTrigger>
                  <Bell
                    className={cn(
                      "size-4",
                      notificationsSettings.ntfyNotifications
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {notificationsSettings.ntfyNotifications
                    ? t("table.notifications.ntfy.enabled")
                    : t("table.notifications.ntfy.disabled")}
                </TooltipContent>
              </Tooltip>
            </div>


          </div>
        );
      }
    }
    ,
    {
      accessorKey: "role",
      header: ({ column }) => {
        return (
          <Button
            className="-ml-3"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            {t("table.headers.role")}
            <ArrowUpDown className="size-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const userRoles = row.original.roles;
        const labeledRoles = roles.filter((role) =>
          userRoles.includes(castRoleFromBackendToFrontend(role.value))
        );
        const [mainRole, ...otherRoles] = labeledRoles;
        return (
          <div className="flex items-center gap-2">
            <Badge variant="success" className="capitalize">
              {mainRole?.label || ""}
            </Badge>

            {otherRoles.length > 0 && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Badge variant="outline" className="cursor-pointer">
                    {t("table.more", { count: otherRoles.length })}
                  </Badge>
                </HoverCardTrigger>

                <HoverCardContent className="w-fit">
                  <div className="flex max-w-[500px] flex-wrap gap-2 overflow-x-auto">
                    {otherRoles.map((role) => (
                      <Badge key={role.value} variant="secondary" className="capitalize">
                        {role.label}
                      </Badge>
                    ))}
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
          </div>
        );
      }
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild >

              <div className="relative">
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("table.actions.title")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  router.push(`/dashboard/users/profile/${row.original.id}`);
                }}>
                {t("table.actions.viewDetails")}
              </DropdownMenuItem>
              {user && hasPermissions(user.roles, "usersManagement", "edit") && (
                <DropdownMenuItem
                  onSelect={() => {
                    setUserToUpdate(row.original);
                  }}>
                  {t("table.actions.edit")}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => copyToClipboard({ text: row.original.id })}
              >
                <>
                  {t("table.actions.ntfyTopic.copy")}
                </>
              </DropdownMenuItem>
              {user && hasPermissions(user.roles, "usersManagement", "delete") && (
                <DropdownMenuItem
                  onSelect={() => {
                    removeUserWithoutSelection(row.original.id);
                  }}>
                  {t("table.actions.delete")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];
  const sortMapping: Record<string, { asc: UsersCriteriaType; desc: UsersCriteriaType }> = {
    name: { asc: "nameAsc", desc: "nameDesc" },
    workedProjects: { asc: "workedProjectsAsc", desc: "workedProjectsDesc" },
    createdAt: { asc: "createdAtAsc", desc: "createdAtDesc" },
    workedHours: { asc: "workedHoursAsc", desc: "workedHoursDesc" }
  };

  const debouncedSearch = useDebounce(searchInput, 500);
  React.useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const table = useReactTable({
    data: users ?? [],
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

  React.useEffect(() => {
    if (copied) toast.success(t("success.ntfyTopicCopied"))
  }, [copied])

  const Filters = () => {
    return (
      <>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <PlusCircle />
              {t("table.filters.roles.label")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-0">
            <Command>
              <CommandInput placeholder={t("table.filters.roles.placeholder")} className="h-9" />
              <CommandList>
                <CommandEmpty>{t("table.filters.roles.noResults")}</CommandEmpty>
                <CommandGroup>
                  {roles.map((roleItem) => (
                    <CommandItem
                      key={roleItem.value}
                      value={roleItem.value}
                      onSelect={() => {
                        if (selectedRoles.includes(castRoleFromBackendToFrontend(roleItem.value))) {
                          setSelectedRoles(
                            selectedRoles.filter(
                              (selectedRole) =>
                                selectedRole !== castRoleFromBackendToFrontend(roleItem.value)
                            )
                          );
                        } else {
                          setSelectedRoles([
                            ...selectedRoles,
                            castRoleFromBackendToFrontend(roleItem.value)
                          ]);
                        }
                        applyFilter();
                      }}>
                      <div className="flex items-center space-x-3 py-1">
                        <Checkbox
                          id={roleItem.value}
                          checked={selectedRoles.includes(
                            castRoleFromBackendToFrontend(roleItem.value)
                          )}
                        />
                        <label
                          htmlFor={roleItem.value}
                          className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {roleItem.label}
                        </label>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </>
    );
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <Select value={searchBy} onValueChange={setSearchBy}>
            <SelectTrigger className="w-52 lg:w-auto">
              <span className="text-muted-foreground text-sm">{t("table.filters.search.by")}</span>
              <SelectValue placeholder="Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">{t("table.filters.search.name")}</SelectItem>
              <SelectItem value="email">{t("table.filters.search.email")}</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder={t("table.filters.search.placeholder")}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="max-w-sm"
          />
          <div className="hidden gap-2 md:flex">
            <Filters />
          </div>
          {/*filter for mobile*/}
          <div className="inline md:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <FilterIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-4">
                <div className="grid space-y-2">
                  <Filters />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="ms-auto flex gap-2">
          {user &&
            hasPermissions(user.roles, "usersManagement", "delete") &&
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

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {usersAreLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t("table.loading")}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t("table.noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
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

      {user && hasPermissions(user.roles, "usersManagement", "delete") && (
        <DeletionConfirmationDialog
          isOpen={alertModalIsOpen}
          onOpenChange={cancelDeletion}
          title={t("deletion.confirmation.title")}
          description={t("deletion.confirmation.message")}
          warning={warning}
          onCancel={cancelDeletion}
          onConfirm={deleteAllElements}
          isPending={isDeletionPending}
        />
      )}

      {user && hasPermissions(user.roles, "usersManagement", "edit") && userToUpdate && (
        <UploadUserDialog
          user={userToUpdate}
          onClose={() => setUserToUpdate(null)}
          triggerOpenning={userToUpdate != null}
          triggerButtonIsUsed={false}
        />
      )}
    </div>
  );
}

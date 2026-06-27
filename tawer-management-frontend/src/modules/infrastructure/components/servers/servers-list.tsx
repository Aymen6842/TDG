"use client"
import * as React from "react"
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ColumnsIcon, FilterIcon, MoreHorizontal, PlusCircle, Trash2Icon } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { ServerStatusType, ServerType } from "../../types/servers"
import { useTranslations } from "next-intl"
import useServers from "../../hooks/extractions/servers"
import Loading from "@/components/page-loader"
import ServerDetailsModal from "./server-details-modal"
import useElementsDeletion from "@/hooks/use-elements-deletion"
import useCurrentUser from "@/modules/auth/hooks/users/use-user"
import { hasPermissions } from "@/modules/auth/utils/users-permissions"
import DeletionConfirmationDialog from "@/modules/users/components/deletion/deletion-confirmation-dialog"
import UploadServerDialog from "./upload"
import { CheckedState } from "@radix-ui/react-checkbox"

export default function ServersList() {
  const t = useTranslations("modules.infrastructure.servers")
  const paginationContent = useTranslations("shared.pagination")

  const limit = 20
  const { servers, serversAreLoading, pagesNumber: pages, setPage, page, search, setSearch, serverStatuses, setServerStatuses } = useServers({ limit })
  const { user } = useCurrentUser();

  const {
    isPending: isDeletionPending,
    addElementToDeletionList: addServerToDeletionList,
    removeElementFromDeletionList: removeServerFromDeletionList,
    removeElementDirectlyWithoutElementsSelection: removeServerWithoutSelection,
    alertModalIsOpen,
    cancelDeletion,
    deleteAllElements,
    onDelete,
    warning
  } = useElementsDeletion("server");

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [selectedServer, setSelectedServer] = React.useState<ServerType | null>(null)
  const [serverPreviewIsOpen, setServerPreviewIsOpen] = React.useState(false)
  const [serverToUpdate, setServerToUpdate] = React.useState<ServerType | null>(null)

  const columns = [
    {
      id: "select",
      header: ({ table }: any) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t("table.headers.select")}
        />
      ),
      cell: ({ row }: any) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            if (row.getIsSelected()) removeServerFromDeletionList(row.original.id);
            else addServerToDeletionList(row.original.id);
          }}
          aria-label={t("table.headers.select")}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: () => (
        <Button className="-ml-3" variant="ghost">
          {t("table.headers.name")}
          <ArrowUpDown className="size-3" />
        </Button>
      ),
      cell: ({ row }: any) => <div className="capitalize">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "domain",
      header: t("table.headers.domain"),
      cell: ({ row }: any) => <div className="text-sm">{row.getValue("domain")}</div>,
    },
    {
      accessorKey: "ip",
      header: t("table.headers.ip"),
      cell: ({ row }: any) => <div className="font-mono text-sm">{row.getValue("ip")}</div>,
    },
    {
      accessorKey: "cpus",
      header: t("table.headers.cpus"),
      cell: ({ row }: any) => <div className="text-sm">{row.getValue("cpus")}</div>,
    },
    {
      accessorKey: "ram",
      header: t("table.headers.ram"),
      cell: ({ row }: any) => <div className="text-sm">{row.getValue("ram")}</div>,
    },
    {
      accessorKey: "storage",
      header: t("table.headers.storage"),
      cell: ({ row }: any) => <div className="text-sm">{row.getValue("storage")}</div>,
    },
    {
      accessorKey: "status",
      header: t("table.headers.status"),
      cell: ({ row }: any) => {
        const status = row.getValue("status") as ServerStatusType;
        const statusMap: Record<ServerStatusType, "success" | "destructive" | "warning"> = {
          Running: "success",
          Stopped: "destructive",
          Maintenance: "warning",
        }
        const statusClass = statusMap[status] ?? "default"

        return (
          <Badge variant={statusClass} className="capitalize">
            {t(`statuses.${status.toLowerCase()}`)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "paid",
      header: t("table.headers.paid"),
      cell: ({ row }: any) => {
        const paid = row.getValue("paid")
        return (
          <Badge variant={paid ? "success" : "destructive"}>
            {paid ? t("table.paid") : t("table.unpaid")}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">{t("table.actionsMenu.label")}</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("table.actionsMenu.label")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleViewDetails(row.original)}>
              {t("table.actionsMenu.viewDetails")}
            </DropdownMenuItem>
            {user && hasPermissions(user.roles, "serversManagement", "edit") && (
              <DropdownMenuItem
                onClick={() => setServerToUpdate(row.original)}>
                {t("table.actionsMenu.edit")}
              </DropdownMenuItem>
            )}
            {user && hasPermissions(user.roles, "serversManagement", "delete") && (
              <DropdownMenuItem
                onSelect={() => {
                  removeServerWithoutSelection(row.original.id);
                }}>
                {t("table.actionsMenu.delete")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const table = useReactTable({
    data: servers || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    pageCount: pages,
    manualPagination: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: pages - 1,
        pageSize: limit,
      },
    },
  })

  const statuses: { value: ServerStatusType; label: string }[] = [
    { value: "Running", label: t("statuses.running") },
    { value: "Stopped", label: t("statuses.stopped") },
    { value: "Maintenance", label: t("statuses.maintenance") },
  ]

  const onServerStatusInFilterChanged = (checked: CheckedState, status: ServerStatusType) => {
    if (checked && !serverStatuses.includes(status))
      setServerStatuses(serverStatuses => [...serverStatuses, status])
    else if (!checked && serverStatuses.includes(status))
      setServerStatuses(serverStatuses => serverStatuses.filter(serverStatus => serverStatus !== status))
  }

  const Filters = () => (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <PlusCircle /> {t("filters.statusButton")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-0">
          <Command>
            <CommandInput placeholder={t("filters.statusSearchPlaceholder")} className="h-9" />
            <CommandList>
              <CommandEmpty>{t("filters.noStatusFound")}</CommandEmpty>
              <CommandGroup>
                {statuses.map((status) => (
                  <CommandItem key={status.value} value={status.value}>
                    <div className="flex items-center space-x-3 py-1">
                      <Checkbox
                        id={status.value}
                        checked={serverStatuses.includes(status.value)}
                        onCheckedChange={(checked) => onServerStatusInFilterChanged(checked, status.value)}
                      />
                      <label
                        htmlFor={status.value}
                        className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {status.label}
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
  )

  const handleViewDetails = (server: ServerType) => {
    setSelectedServer(server)
    setServerPreviewIsOpen(true)
  }

  if (serversAreLoading) return <Loading />

  return (
    <>
      <div className="w-full space-y-4">
        {/* Search and filters */}
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("search.placeholder")} className="max-w-sm" />

            <div className="hidden gap-2 md:flex">
              <Filters />
            </div>

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
              hasPermissions(user.roles, "serversManagement", "delete") &&
              table.getSelectedRowModel().rows.length > 0 && (
                <Button variant="destructive" onClick={() => onDelete()}>
                  <Trash2Icon />
                </Button>
              )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <span className="hidden lg:inline">{t("columnsDropdown.label")}</span> <ColumnsIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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

        {/* Pagination */}
        <div className="flex items-center justify-end space-x-2">
          <div className="text-muted-foreground flex-1 text-sm">
            {paginationContent.rich("selected", {
              page: page,
              pages: pages,
              records: limit,
            })}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                table.previousPage()
                setPage(page - 1)
              }}
              disabled={!table.getCanPreviousPage()}
            >
              {paginationContent("previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                table.nextPage()
                setPage(page + 1)
              }}
              disabled={!table.getCanNextPage()}
            >
              {paginationContent("next")}
            </Button>
          </div>
        </div>
      </div>

      {user && hasPermissions(user.roles, "serversManagement", "delete") && (
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
      {/* Server Edit Dialog */}
      {serverToUpdate && user && hasPermissions(user.roles, "serversManagement", "edit") && (
        <UploadServerDialog
          server={serverToUpdate}
          onClose={() => setServerToUpdate(null)}
          triggerOpenning={serverToUpdate != null}
          triggerButtonIsUsed={false}
        />
      )}
      {/* Server Details Modal */}
      <ServerDetailsModal server={selectedServer} isOpen={serverPreviewIsOpen} onOpenChange={setServerPreviewIsOpen} />
    </>
  )
}

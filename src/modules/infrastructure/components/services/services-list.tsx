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
  type ColumnDef,
} from "@tanstack/react-table"
import { ArrowUpDown, ColumnsIcon, FilterIcon, MoreHorizontal, PlusCircle, Trash2Icon } from "lucide-react"
import { useTranslations } from "next-intl"

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import Loading from "@/components/page-loader"

import type { ServiceType, ServiceStatusType } from "../../types/services"
import ServiceDetailsModal from "./service-details-modal"
import useServers from "../../hooks/extractions/servers"
import useServices from "../../hooks/extractions/services"
import useElementsDeletion from "@/hooks/use-elements-deletion"
import useCurrentUser from "@/modules/auth/hooks/users/use-user"
import { hasPermissions } from "@/modules/auth/utils/users-permissions"
import DeletionConfirmationDialog from "@/modules/users/components/deletion/deletion-confirmation-dialog"
import UploadServiceDialog from "./upload"

interface ServicesListProps {
  limit?: number
}

export default function ServicesList({ limit = 20 }: ServicesListProps) {
  const t = useTranslations("modules.infrastructure.services")
  const paginationContent = useTranslations("shared.pagination")
  const serversT = useTranslations("modules.infrastructure.servers")

  const { user } = useCurrentUser();
  const { servers, serversAreLoading } = useServers({})

  const {
    services,
    servicesAreLoading,
    pagesNumber: pages,
    setPage,
    page,
    search,
    setSearch,
    servicesStatuses: selectedServicesStatuses,
    setServicesStatuses,
    serversIds: selectedServersIds,
    setServersIds
  } = useServices({
    limit,

  })

  const {
    isPending: isDeletionPending,
    addElementToDeletionList: addServiceToDeletionList,
    removeElementFromDeletionList: removeServiceFromDeletionList,
    removeElementDirectlyWithoutElementsSelection: removeServiceWithoutSelection,
    alertModalIsOpen,
    cancelDeletion,
    deleteAllElements,
    onDelete,
    warning
  } = useElementsDeletion("service");

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [selectedService, setSelectedService] = React.useState<ServiceType | null>(null)
  const [servicePreviewIsOpen, setServicePreviewIsOpen] = React.useState(false)
  const [serviceToUpload, setServiceToUpload] = React.useState<ServiceType | null>(null)

  const handleViewDetails = (service: ServiceType) => {
    setSelectedService(service)
    setServicePreviewIsOpen(true)
  }

  const handleCheckServer = (serverId: string) => {
    const newServersIds = selectedServersIds.includes(serverId)
      ? selectedServersIds.filter((id) => id !== serverId)
      : [...selectedServersIds, serverId]
    setServersIds(newServersIds)
  }

  const handleCheckStatus = (status: ServiceStatusType) => {
    const newServicesStatuses = selectedServicesStatuses.includes(status)
      ? selectedServicesStatuses.filter((selectedStatus) => selectedStatus !== status)
      : [...selectedServicesStatuses, status]
    setServicesStatuses(newServicesStatuses)
  }

  const handleEditService = (service: ServiceType) => {
    setServiceToUpload(service)
  }

  const columns: ColumnDef<ServiceType>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label={t("table.headers.select")}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
              if (row.getIsSelected()) removeServiceFromDeletionList(row.original.id);
              else addServiceToDeletionList(row.original.id);
            }}
            aria-label={t("table.headers.select")}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("table.headers.name")}
            <ArrowUpDown className="ml-2 size-3" />
          </Button>
        ),
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
      },
      {
        accessorKey: "domain",
        header: t("table.headers.domain"),
        cell: ({ row }) => <div className="text-sm">{row.getValue("domain")}</div>,
      },
      {
        accessorKey: "status",
        header: t("table.headers.status"),
        cell: ({ row }) => {
          const status = row.getValue("status") as ServiceStatusType
          const statusMap: Record<ServiceStatusType, "success" | "destructive" | "warning"> = {
            Running: "success",
            Stopped: "destructive",
            Maintenance: "warning",
          }
          const variant = statusMap[status] ?? "default"

          return (
            <Badge variant={variant} className="capitalize">
              {t(`statuses.${status.toLowerCase()}`)}
            </Badge>
          )
        },
      },
      {
        accessorKey: "paid",
        header: t("table.headers.paid"),
        cell: ({ row }) => {
          const paid = row.getValue("paid")
          return <Badge variant={paid ? "success" : "destructive"}>{paid ? t("table.paid") : t("table.unpaid")}</Badge>
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
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
              {user && hasPermissions(user.roles, "servicesManagement", "edit") && (
                <DropdownMenuItem
                  onSelect={() => {
                    handleEditService(row.original);
                  }}>
                  {t("table.actionsMenu.edit")}
                </DropdownMenuItem>
              )}
              {user && hasPermissions(user.roles, "servicesManagement", "delete") && (
                <DropdownMenuItem
                  onSelect={() => {
                    removeServiceWithoutSelection(row.original.id);
                  }}>
                  {t("table.actionsMenu.delete")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t],
  )

  const table = useReactTable({
    data: services || [],
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
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
  })

  const displayedServicesStatus: { value: ServiceStatusType; label: string }[] = [
    { value: "Running", label: t("statuses.running") },
    { value: "Stopped", label: t("statuses.stopped") },
    { value: "Maintenance", label: t("statuses.maintenance") },
  ]

  const Filters = () => (
    <>
      {/* Status Filter */}
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
                {displayedServicesStatus.map((status) => (
                  <CommandItem key={status.value} value={status.value}>
                    <div className="flex items-center space-x-3 py-1">
                      <Checkbox
                        id={status.value}
                        checked={selectedServicesStatuses.includes(status.value)}
                        onCheckedChange={() => handleCheckStatus(status.value)}
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

      {serversAreLoading ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <PlusCircle /> {serversT("list.title")}
            </Button>
          </PopoverTrigger>
        </Popover>
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <PlusCircle /> {serversT("list.title")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-0">
            <Command>
              <CommandInput placeholder={serversT("filters.searchPlaceholder")} className="h-9" />
              <CommandList>
                {!servers || servers.length === 0 ? (
                  <CommandEmpty>{serversT("list.noResults")}</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {servers.map((server) => (
                      <CommandItem key={server.id} value={server.id}>
                        <div className="flex items-center space-x-3 py-1">
                          <Checkbox
                            id={server.id}
                            checked={selectedServersIds.includes(server.id)}
                            onCheckedChange={() => handleCheckServer(server.id)}
                          />
                          <label
                            htmlFor={server.id}
                            className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {server.name}
                          </label>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </>
  )

  if (servicesAreLoading) return <Loading />

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <Input
            placeholder={t("filters.searchPlaceholder")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-sm"
          />

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
            hasPermissions(user.roles, "servicesManagement", "delete") &&
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
            records: services?.length || 0,
          })}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={!table.getCanPreviousPage() || page <= 1}
          >
            {paginationContent("previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={!table.getCanNextPage() || page >= pages}
          >
            {paginationContent("next")}
          </Button>
        </div>
      </div>

      {user && hasPermissions(user.roles, "servicesManagement", "delete") && (
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
      {serviceToUpload && user && hasPermissions(user.roles, "serversManagement", "edit") && (
        <UploadServiceDialog
          service={serviceToUpload}
          onClose={() => setServiceToUpload(null)}
          triggerOpenning={serviceToUpload != null}
          triggerButtonIsUsed={false}
        />
      )}

      <ServiceDetailsModal
        service={selectedService}
        isOpen={servicePreviewIsOpen}
        onOpenChange={setServicePreviewIsOpen}
      />
    </div>
  )
}

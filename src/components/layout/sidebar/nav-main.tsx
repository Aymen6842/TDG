"use client";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/components/ui/sidebar";
import {
  ChevronRight,
  UserIcon,
  UsersIcon,
  type LucideIcon,
  CalendarIcon,
  LockIcon,
  PaletteIcon,
  BellIcon,
  User,
  Settings,
  SquareCheckIcon,
  House,
  Server,
  SquareKanbanIcon,
  Scale,
} from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { UserType } from "@/modules/users/types/users";
import useUser from "@/modules/auth/hooks/users/use-user";
import { useTranslations } from "next-intl";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";

type NavGroup = {
  title: string;
  items: NavItem;
};

type NavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  isComing?: boolean;
  isDataBadge?: string;
  isNew?: boolean;
  newTab?: boolean;
  disabled?: boolean;
  items?: NavItem;
}[];

export function getNavItems({
  user,
  t
}: {
  user: UserType;
  t: (key: string) => string;
}): NavGroup[] {
  return [
    {
      title: t("navigation.projectsManagement"),
      items: [
        {
          title: t("navigation.welcome"),
          href: "/dashboard",
          icon: House,
        },
        {
          title: t("navigation.projectsManagement"),
          href: "/dashboard/projects",
          icon: SquareKanbanIcon
        },
        {
          title: t("navigation.todoList"),
          href: "/dashboard/todo-list",
          icon: SquareCheckIcon,
        },
        {
          title: t("navigation.calendar"),
          href: "#",
          icon: CalendarIcon,
          items: [
            {
              title: t("navigation.meetings"),
              href: "/dashboard/calendar/meetings",
              disabled: !hasPermissions(user.roles, "meetingsManagement", "view")
            },
            {
              title: t("navigation.events"),
              href: "/dashboard/calendar/events",
              disabled: !hasPermissions(user.roles, "eventsManagement", "view")
            },
            {
              title: t("navigation.personalCalendar"),
              href: "/dashboard/calendar/personal"
            }
          ]
        },

        {
          title: t("navigation.usersManagement"),
          href: "#",
          icon: UsersIcon,
          items: [
            {
              title: t("navigation.users"),
              href: "/dashboard/users",
              disabled: !hasPermissions(user.roles, "usersManagement", "view")
            },
            {
              title: t("navigation.teams"),
              href: "/dashboard/users/teams",
              disabled: !hasPermissions(user.roles, "teamsManagement", "view")
            }
          ]
        },

        {
          title: t("navigation.infrastructure"),
          href: "#",
          icon: Server,
          items: [
            {
              title: t("navigation.servers"),
              href: "/dashboard/infrastructure/servers",
              disabled: !hasPermissions(user.roles, "serversManagement", "view")
            },
            {
              title: t("navigation.services"),
              href: "/dashboard/infrastructure/services",
              disabled: !hasPermissions(user.roles, "servicesManagement", "view")
            },
          ]
        },
        {
          title: t("navigation.accountSettings"),
          href: "#",
          icon: Settings,
          items: [
            {
              title: t("navigation.account"),
              href: "/dashboard/account-settings/account",
              icon: UserIcon
            },
            {
              title: t("navigation.passwords"),
              href: "/dashboard/account-settings/password",
              icon: LockIcon
            },
            {
              title: t("navigation.appearance"),
              href: "/dashboard/account-settings/appearance",
              icon: PaletteIcon
            }
          ]
        },

        {
          title: t("navigation.notifications"),
          href: "/dashboard/notifications",
          icon: BellIcon,
          items: [
            {
              title: t("navigation.viewAllNotifications"),
              href: "/dashboard/notifications/view",
              icon: BellIcon
            },
            {
              title: t("navigation.notificationsSettings"),
              href: "/dashboard/notifications/settings",
              icon: Settings
            }
          ]
        },

        {
          title: t("navigation.myProfile"),
          href: user ? `/dashboard/users/profile/me` : "#",
          icon: User
        },
        {
          title: "Company Rules",
          href: user ? `/dashboard/rules` : "#",
          icon: Scale
        }
      ]
    }
  ];
}

export function NavMain() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const { user } = useUser();
  const t = useTranslations("shared.sidebar");

  return (
    <>
      {user &&
        getNavItems({ user, t }).map((nav) => (
          <SidebarGroup key={nav.title}>
            <SidebarGroupLabel>{nav.title}</SidebarGroupLabel>
            <SidebarGroupContent className="flex flex-col gap-2">
              <SidebarMenu>
                {nav.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {Array.isArray(item.items) && item.items.length > 0 ? (
                      <>
                        <div className="hidden group-data-[collapsible=icon]:block">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <SidebarMenuButton tooltip={item.title}>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                              </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              side={isMobile ? "bottom" : "right"}
                              align={isMobile ? "end" : "start"}
                              className="min-w-48 rounded-lg">
                              <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                              {item.items?.map((item) => (
                                <DropdownMenuItem
                                  className={`hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10! active:bg-[var(--primary)]/10! ${item.disabled
                                    ? "pointer-events-none cursor-not-allowed opacity-50"
                                    : ""
                                    }`}
                                  asChild={!item.disabled}
                                  key={item.title}>
                                  {!item.disabled ? (
                                    <a href={item.href}>{item.title}</a>
                                  ) : (
                                    <span>{item.title}</span>
                                  )}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <Collapsible
                          className="group/collapsible block group-data-[collapsible=icon]:hidden"
                          defaultOpen={!!item.items.find((s) => s.href === pathname)}>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              className={`hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10 ${item.disabled
                                ? "pointer-events-none cursor-not-allowed opacity-50"
                                : ""
                                }`}
                              tooltip={item.title}>
                              {item.icon && <item.icon />}
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item?.items?.map((subItem, key) => (
                                <SidebarMenuSubItem key={key}>
                                  <SidebarMenuSubButton
                                    className={`hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10 ${subItem.disabled
                                      ? "pointer-events-none cursor-not-allowed opacity-50"
                                      : ""
                                      }`}
                                    isActive={pathname === subItem.href}
                                    asChild={!subItem.disabled}
                                    onClick={
                                      subItem.disabled ? (e) => e.preventDefault() : () => { }
                                    }>
                                    {!subItem.disabled ? (
                                      <Link
                                        href={subItem.href}
                                        target={subItem.newTab ? "_blank" : ""}>
                                        <span>{subItem.title}</span>
                                      </Link>
                                    ) : (
                                      <span>{subItem.title}</span>
                                    )}
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      </>
                    ) : (
                      <SidebarMenuButton
                        className={`hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10 ${item.disabled ? "pointer-events-none cursor-not-allowed opacity-50" : ""
                          }`}
                        isActive={pathname === item.href}
                        tooltip={item.title}
                        asChild={!item.disabled}
                        onClick={item.disabled ? (e) => e.preventDefault() : () => { }}>
                        {!item.disabled ? (
                          <Link href={item.href} target={item.newTab ? "_blank" : ""}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                          </Link>
                        ) : (
                          <div>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                          </div>
                        )}
                      </SidebarMenuButton>
                    )}
                    {!!item.isComing && (
                      <SidebarMenuBadge className="peer-hover/menu-button:text-foreground opacity-50">
                        Coming
                      </SidebarMenuBadge>
                    )}
                    {!!item.isNew && (
                      <SidebarMenuBadge className="border border-green-400 text-green-600 peer-hover/menu-button:text-green-600">
                        New
                      </SidebarMenuBadge>
                    )}
                    {!!item.isDataBadge && (
                      <SidebarMenuBadge className="peer-hover/menu-button:text-foreground">
                        {item.isDataBadge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
    </>
  );
}

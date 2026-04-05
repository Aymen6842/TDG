"use client";
import * as React from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useIsTablet } from "@/hooks/use-mobile";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/layout/sidebar/nav-main";
import { ScrollArea } from "@/components/ui/scroll-area";
import Logo from "@/components/layout/logo";
import usePlatform from "@/hooks/use-platform";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();

  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const isTablet = useIsTablet();
  const { platform } = usePlatform();

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname]);

  useEffect(() => {
    setOpen(!isTablet);
  }, [isTablet]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push("/dashboard")}
              className="hover:text-foreground h-10 group-data-[collapsible=icon]:px-0! hover:bg-[var(--primary)]/5">
              <Logo />
              <span className="font-semibold">{platform.name}</span>
            </SidebarMenuButton>
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="hover:text-foreground h-10 group-data-[collapsible=icon]:px-0! hover:bg-[var(--primary)]/5">
                  <Logo />
                  <span className="font-semibold">Tawer Management</span>
                  <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger> */}
            {/* <DropdownMenuContent
                className="mt-4 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}>
                <DropdownMenuLabel>Projects</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-md border">
                    <ShoppingBagIcon className="text-muted-foreground size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">E-commerce</span>
                    <span className="text-xs text-green-700">Active</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-md border">
                    <UserCircle2Icon className="text-muted-foreground size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Blog Platform</span>
                    <span className="text-muted-foreground text-xs">Inactive</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Button className="w-full">
                  <PlusIcon />
                  New Project
                </Button>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <NavMain />
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { generateMeta } from "@/lib/utils";
import { SidebarNav } from "@/components/shared/sidebar-nav";

function getNavItems(t: (key: string) => string) {
  return [
    {
      title: t("viewAll"),
      href: "/dashboard/notifications/view",
      icon: "BellIcon"
    },
    {
      title: t("settings.title"),
      href: "/dashboard/notifications/settings",
      icon: "Settings"
    }
  ];
}

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Account Settings Page",
    description:
      "Manage your account settings including profile, appearance, billing, notifications, and password.",
    canonical: "/pages/account-settings"
  });
}

export default async function AccountSettingsLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("modules.notifications");

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
        <aside className="lg:w-64">
          <SidebarNav navItems={getNavItems(t)} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  );
}

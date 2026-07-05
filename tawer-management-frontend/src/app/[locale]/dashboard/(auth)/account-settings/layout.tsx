import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { generateMeta } from "@/lib/utils";
import { SidebarNav } from "@/components/shared/sidebar-nav";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.accountSettings");

  return generateMeta({
    title: t("title"),
    description: t("description"),
    canonical: "/pages/account-settings"
  });
}

export default async function AccountSettingsLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("modules.auth.account.settingsLayout");
  const tNav = await getTranslations("shared.sidebar.navigation");

  const navItems = [
    {
      title: tNav("account"),
      href: "/dashboard/account-settings/account",
      icon: "UserIcon"
    },
    {
      title: tNav("passwords"),
      href: "/dashboard/account-settings/password",
      icon: "ShieldIcon"
    },
    {
      title: tNav("appearance"),
      href: "/dashboard/account-settings/appearance",
      icon: "PaletteIcon"
    },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
        <aside className="lg:w-64">
          <SidebarNav navItems={navItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  );
}

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { generateMeta } from "@/lib/utils";
import { SidebarNav } from "@/components/shared/sidebar-nav";

const navItems = [
  {
    title: "Account",
    href: "/dashboard/account-settings/account",
    icon: "UserIcon"
  },
  {
    title: "Password",
    href: "/dashboard/account-settings/password",
    icon: "ShieldIcon"
  },
  {
    title: "Appearance",
    href: "/dashboard/account-settings/appearance",
    icon: "PaletteIcon"
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Account Settings Page",
    description:
      "Manage your account settings including profile, appearance, billing, notifications, and password.",
    canonical: "/pages/account-settings"
  });
}

export default async function AccountSettingsLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("settingsManagement.layout");

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-muted-foreground">Manage your account configuration and preferences.</p>
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

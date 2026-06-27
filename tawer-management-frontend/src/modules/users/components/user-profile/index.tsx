"use client";;
import { ProfileHeader } from "./header";
import { ProfileSidebar } from "./sidebar";
import Loading from "@/components/page-loader";
import Error404 from "@/components/error/404";
import type { UserType } from "../../types/users";
import ActivityTrackingAndWorkerDateRating from "@/modules/tracking/components/activity-tracking-working-date-rating";
import WorkedDaysTracking from "@/modules/tracking/components/work-tracking-calendar.tsx";

interface Props {
  user?: UserType | null;
  isLoading: boolean;
  isMyProfile?: boolean;
}

export function ProfilePage({ user, isLoading, isMyProfile = false }: Props) {
  return isLoading ? (
    <Loading />
  ) : user === null ? (
    <Error404 />
  ) : (
    user && (
      /* Simplified layout following the shadcn-inspired structure */
      <div className="bg-background min-h-screen font-sans antialiased">
        <ProfileHeader user={user} />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="space-y-6">
              <ProfileSidebar user={user} />
            </aside>

            <main className="space-y-8">
              <ActivityTrackingAndWorkerDateRating userId={user.id} isMyProfile={isMyProfile} />
              <WorkedDaysTracking userId={user.id} isMyProfile={isMyProfile} />
            </main>
          </div>
        </div>
      </div>
    )
  );
}

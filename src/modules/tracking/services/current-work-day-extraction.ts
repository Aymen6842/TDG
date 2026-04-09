import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { GET } from "@/lib/http-methods";
import castToActivityTrackingType from "../dto/responses/activity-tracking";
import { USE_MOCK } from "@/lib/mock-config"; // REMOVE THIS LINE FOR PROD

export async function retreiveCurrentWorkDayFromServerSide() {
  if (USE_MOCK()) return null; // REMOVE THIS LINE FOR PROD

  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };

  try {
    const response = await GET(`/work-days/current`, headers);

    return castToActivityTrackingType(response.data);
  } catch (error) {
    return null
  }
}

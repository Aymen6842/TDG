import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { GET } from "@/lib/http-methods";
import castToActivityTrackingType from "../dto/responses/activity-tracking";

export async function retreiveCurrentWorkDayFromServerSide() {
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

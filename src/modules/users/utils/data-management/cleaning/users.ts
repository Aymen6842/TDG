import { getPhoneNumberDetails } from "@/lib/phone-number";
import { UserFormSchema } from "../../../validation/schemas/user.schema";
import { CountryCode } from "libphonenumber-js";

/**
 * Cleans and converts user object conforming to UserFormSchema into a FormData object.
 * This is necessary for uploading to clean unused data and make sure we submit data that backend is waiting for
 *
 * @param data - The user object to convert.
 * @returns A new FormData object.
 */
export function cleanUserDataToUpload(data: UserFormSchema): FormData {
  const formData = new FormData();

  // Append 'content' and 'metaContent' array as a JSON string
  formData.append(`name`, data.fullName);
  formData.append(`email`, data.email);
  formData.append(
    `phone`,
    getPhoneNumberDetails(data.phone, process.env.COUNTRY_CODE as CountryCode)?.number || ""
  );

  if (data.password) formData.append("password", data.password);

  //image addition
  if (data.image) formData.append(`image`, data.image);
  //image was deleted
  else if (!data.imageUrl) formData.append("image", "null");

  formData.append("roles", data.roles.join(","));

  //notifications settings addition
  formData.append("emailNotificationsEnabled", data.emailNotifications ? "true" : "false");
  formData.append("telegramNotificationsEnabled", data.telegramNotifications ? "true" : "false");
  formData.append("ntfyNotificationsEnabled", data.ntfyNotifications ? "true" : "false");
  if (data.telegramNotifications && data.telegramChatId && data.telegramChatId.trim().length > 0)
    formData.append("telegramChatId", data.telegramChatId.trim());

  return formData;
}

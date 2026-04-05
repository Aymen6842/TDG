import { getPhoneNumberDetails } from "@/lib/phone-number";
import { CountryCode } from "libphonenumber-js";
import { UserChangementFormSchema } from "@/modules/auth/validation/schemas/user-changement.schema";
import { SignUpFormSchemaType } from "@/modules/auth/validation/schemas/auth/sign-up";

/**
 * Cleans and converts user object conforming to UserFormSchema into a FormData object.
 * This is necessary for uploading to clean unused data and make sure we submit data that backend is waiting for
 *
 * @param data - The user object to convert.
 * @returns A new FormData object.
 */
export function cleanUserChangementDataToUpload(data: UserChangementFormSchema): FormData {
  const formData = new FormData();

  // Append 'content' and 'metaContent' array as a JSON string
  formData.append(`name`, data.fullName);
  formData.append(
    `phone`,
    getPhoneNumberDetails(data.phone, process.env.COUNTRY_CODE as CountryCode)?.number || ""
  );

  //image addition
  if (data.image) formData.append(`image`, data.image);
  //image was deleted
  else if (!data.imageUrl) formData.append("image", "null");

  return formData;
}

/**
 * Cleans and converts user object conforming to UserFormSchema into a FormData object.
 * This is necessary for uploading to clean unused data and make sure we submit data that backend is waiting for
 *
 * @param data - The user object to convert.
 * @returns A new FormData object.
 */
export function cleanSignUpDataToUpload(data: SignUpFormSchemaType): FormData {
  const formData = new FormData();
  // Append 'content' and 'metaContent' array as a JSON string
  formData.append(`name`, data.name);
  formData.append(`email`, data.email);
  formData.append(`phone`, getPhoneNumberDetails(data.phone, process.env.COUNTRY_CODE as CountryCode)?.number as string);
  formData.append(`password`, data.password);

  //image addition
  formData.append(`image`, data.image);

  return formData;
}
import parsePhoneNumberFromString, {
  CountryCode,
  getExampleNumber,
} from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";

/**
 * It returns an example phone number for a given country code
 * @param countryCode
 * @returns  an object containing the country, national number (29299122), country calling code(216), and number (calling code + national number) of the example phone number, or null if no example is found
 */
export function getPhoneNumberExample(countryCode: CountryCode) {
  const phoneNumberExample = getExampleNumber(countryCode, examples);

  if (phoneNumberExample)
    return {
      country: phoneNumberExample.country,
      nationalNumber: phoneNumberExample.nationalNumber,
      countryCallingCode: phoneNumberExample.countryCallingCode,
      number: phoneNumberExample.number,
    };

  return null;
}

/**
 * This function used to extract and validate phone number details from a given phone number string and country code.
 * @param phoneNumber
 * @param countryCode
 * @returns An object containing the country, national number, country calling code, and the original phone number if the phone number is valid; otherwise, it returns null.
 */
export function getPhoneNumberDetails(
  phoneNumber: string,
  countryCode: CountryCode
) {
  const phoneNumberDetails = parsePhoneNumberFromString(
    phoneNumber,
    countryCode
  );

  if (phoneNumberDetails && phoneNumberDetails.isValid()) {
    return {
      country: phoneNumberDetails.country,
      nationalNumber: phoneNumberDetails.nationalNumber,
      countryCallingCode: phoneNumberDetails.countryCallingCode,
      number: phoneNumberDetails.number,
    };
  }

  return null;
}

/**
 * This function used to validate a phone number
 * @param phoneNumber
 * @param countryCode
 * @returns A boolean value indicating whether the phone number is valid or not.
 */
export function validatePhoneNumber(
  phoneNumber: string,
  countryCode: CountryCode
) {
  const phoneNumberDetails = parsePhoneNumberFromString(
    phoneNumber,
    countryCode
  );

  return phoneNumberDetails && phoneNumberDetails.isValid() ? true : false;
}

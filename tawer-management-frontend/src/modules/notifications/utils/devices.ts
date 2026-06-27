// utils/get-device-info.ts
export function getDeviceInfo() {
  const userAgent = navigator.userAgent;

  let device = "Other";
  let deviceType: "Ios" | "Android" | "Computer" = "Computer";

  if (/iPhone|iPad|iPod/.test(userAgent)) {
    device = "iPhone";
    deviceType = "Ios";
  } else if (/Android/.test(userAgent)) {
    device = "Android";
    deviceType = "Android";
  } else if (/Windows|Macintosh|Linux/.test(userAgent)) {
    device = "PC";
    deviceType = "Computer";
  }

  return { device, deviceType };
}

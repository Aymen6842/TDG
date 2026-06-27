export default function extractJWTokens() {
  let access = localStorage.getItem("access");
  let refresh = localStorage.getItem("refresh");

  //verification if we've tokens in side cookies
  if (!(access && refresh)) {
    //checking if we've tokens inside the cookie
    const cookies = document.cookie.split("; ");
    const accessCookieValue = cookies.find((cookie) => cookie.startsWith("x-At="));

    const refreshCookieValue = cookies.find((cookie) => cookie.startsWith("x-Rt="));

    if (accessCookieValue && refreshCookieValue) {
      access = accessCookieValue.split("=")[1];
      refresh = refreshCookieValue.split("=")[1];

      //cookies deletion
      const d = new Date();
      document.cookie = `x-At=; Path=/; expires=${d.toUTCString()}`;
      document.cookie = `x-Rt=; Path=/; expires=${d.toUTCString()}`;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
    }
  }

  return {
    access,
    refresh
  };
}

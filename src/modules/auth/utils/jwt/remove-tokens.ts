export default function removeJWTTokens() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

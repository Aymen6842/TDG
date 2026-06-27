import removeJWTTokens from "./jwt/remove-tokens";

export function logout() {
  removeJWTTokens();
}

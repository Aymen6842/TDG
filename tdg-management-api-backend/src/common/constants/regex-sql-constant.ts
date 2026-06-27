export class GlobalRegex {
  static readonly SQL_INJECTION_REGEX =
    /^(?!.*\b(select\s+(from|into)|update\s+|delete\s+|insert\s+|drop\s+|alter\s+|create\s+|exec|execute|truncate|grant|revoke)\b).*$/i;
}

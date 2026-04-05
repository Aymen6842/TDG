import { ProjectColor } from "../types/projects";

export default function getProjectTailwindColor(color: ProjectColor) {
  switch (color) {
    case "sky":
      return "bg-sky-400";

    case "amber":
      return "bg-amber-400";

    case "violet":
      return "bg-violet-400";

    case "rose":
      return "bg-rose-400";

    case "emerald":
      return "bg-emerald-400";

    case "orange":
      return "bg-orange-400";

    default:
      return "bg-sky-400";
  }
}

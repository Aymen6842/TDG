import { WorkSessionInResponseType, WorkSessionType } from "../../types/work-sessions";

export default function castToWorkSessionType(
  session: WorkSessionInResponseType
): WorkSessionType {
  if (!session) return {
    id: "",
    status: "out",
    moodIsSubmitted: false,
  }

  return {
    id: session.id,

    status: session.isOpen ? "in" : "out",
    moodIsSubmitted: session.moodIsSubmitted ? true : false,
  };
}

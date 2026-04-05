"use client";

import { useEffect } from "react";
import { EventType } from "../../types";
import { useEventStore } from "../../store/events";

interface Props {
  children: React.ReactNode | React.ReactNode[];
  type: EventType;
}

export default function ({ children, type }: Props) {
  const setEventType = useEventStore((store) => store.setEventType);

  useEffect(() => {
    setEventType(type);
  }, [type]);

  return <>{children}</>;
}

import { useRef, useState } from "react";

//we get time in seconds
export default function useTimer(timer: number) {
  const timerIsWorking = useRef(false);
  const timeCounter = useRef(timer);
  const [displayedTimer, setdisplayedTimer] = useState("05:00");

  function startTimer() {
    timerIsWorking.current = true;

    startCounting();
  }

  function resetTimer() {
    timeCounter.current = timer;
  }

  function startCounting() {
    setTimeout(() => {
      timeCounter.current -= 1;

      const min = Math.floor(timeCounter.current / 60);
      const seconds = timeCounter.current % 60;

      setdisplayedTimer(
        `${min.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );

      if (timerIsWorking.current && timeCounter.current > 0) startCounting();
    }, 1000);
  }

  return {
    timer: timeCounter,
    displayedTimer,
    startTimer,
    resetTimer,
  };
}

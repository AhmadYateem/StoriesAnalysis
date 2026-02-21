import { useEffect, useState } from "react";

export function useCountUp(end: number, duration = 2000, start = 0, trigger = true) {
  const [value, setValue] = useState(start);

  useEffect(() => {
    if (!trigger) return;
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.floor(start + (end - start) * eased));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start, trigger]);

  return value;
}

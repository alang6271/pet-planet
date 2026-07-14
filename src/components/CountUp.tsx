import { useState, useEffect, useRef } from "react";

interface CountUpProps {
  /** 目标数值 */
  end: number;
  /** 动画时长（毫秒），默认 1200 */
  duration?: number;
  /** 延迟启动（毫秒），默认 0 */
  delay?: number;
  className?: string;
}

/**
 * 数字计数动画
 * 从 0 平滑增长到目标值
 */
export default function CountUp({
  end,
  duration = 1200,
  delay = 0,
  className,
}: CountUpProps) {
  const [count, setCount] = useState(0);
  const previousEndRef = useRef(0);

  useEffect(() => {
    const start = previousEndRef.current;
    const diff = end - start;

    if (diff === 0) return;

    let startTime: number | null = null;
    let rafId: number;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(start + eased * diff));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        previousEndRef.current = end;
      }
    };

    const timer = setTimeout(() => {
      rafId = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
    };
  }, [end, duration, delay]);

  return <span className={className}>{count}</span>;
}

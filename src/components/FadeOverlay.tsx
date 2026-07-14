import { useEffect } from "react";

interface FadeOverlayProps {
  /** 动画播放完毕回调（此时应执行跳转） */
  onComplete: () => void;
}

/**
 * 画面淡出过渡层
 * 简单的深空色遮罩淡入，覆盖画面后触发跳转
 */
export default function FadeOverlay({ onComplete }: FadeOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 450);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[200] pointer-events-none bg-space-deepest"
      style={{
        animation: "fadeToDark 0.45s ease-in forwards",
      }}
    />
  );
}

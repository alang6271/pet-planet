import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import FadeOverlay from "@/components/FadeOverlay";

/**
 * Hero 主视觉区
 * 全屏深空背景 + 居中文案 + CTA 按钮
 */
export default function Hero() {
  const navigate = useNavigate();
  const [fading, setFading] = useState(false);

  // 点击「创建纪念星球」时触发淡出过渡
  const handleCreatePlanet = () => {
    setFading(true);
  };

  // 动画播放完毕后跳转
  const handleFadeComplete = () => {
    navigate("/planets");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-4xl mx-auto">
        {/* 小标题 */}
        <p className="text-sm tracking-[0.3em] text-gold uppercase font-sans mb-4 opacity-0 animate-fade-in-up">
          宠物星球 · Pet Planet
        </p>

        {/* 主标题 */}
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-light leading-tight mb-6 opacity-0 animate-fade-in-delay">
          <span className="block text-ink-primary">为逝去的毛孩子</span>
          <span className="block text-gradient-gold font-medium">
            点亮一颗永恒的星
          </span>
        </h1>

        {/* 副标题 */}
        <p className="text-base sm:text-lg text-ink-secondary leading-relaxed max-w-2xl mx-auto mb-8 opacity-0 animate-fade-in-delay-2">
          一个专属的虚拟星球空间，存放回忆，寄托思念
          <br />
          完成一场跨越时空的告别与纪念
        </p>

        {/* CTA 按钮组 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-delay-3">
          <button
            onClick={handleCreatePlanet}
            className="btn-capsule bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-space-deepest font-semibold glow-gold w-full sm:w-auto"
          >
            创建纪念星球
          </button>
          <a
            href="#features"
            className="btn-capsule border border-white/20 hover:border-white/40 text-ink-primary hover:bg-white/5 w-full sm:w-auto"
          >
            了解更多
          </a>
        </div>
      </div>

      {/* 滚动提示 */}
      <a
        href="#concept"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ink-muted hover:text-ink-secondary transition-colors duration-300 animate-float-slow"
        aria-label="向下滚动"
      >
        <ChevronDown className="w-6 h-6" />
      </a>

      {/* 画面淡出过渡层 */}
      {fading && <FadeOverlay onComplete={handleFadeComplete} />}
    </section>
  );
}

/**
 * 页脚
 */
export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🪐</span>
            <span className="font-serif text-base text-ink-primary">
              宠物星球
            </span>
            <span className="text-xs text-ink-muted tracking-widest uppercase">
              Pet-Planet
            </span>
          </div>

          {/* 链接 */}
          <div className="flex items-center gap-6 text-sm text-ink-muted">
            <a href="#" className="hover:text-ink-secondary transition-colors">
              关于我们
            </a>
            <a href="#" className="hover:text-ink-secondary transition-colors">
              隐私政策
            </a>
            <a href="#" className="hover:text-ink-secondary transition-colors">
              联系方式
            </a>
          </div>
        </div>

        {/* 版权 */}
        <div className="mt-6 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-ink-muted">
            © 2026 宠物星球 Pet-Planet · 为逝去的毛孩子，点亮一颗永恒的星
          </p>
        </div>
      </div>
    </footer>
  );
}

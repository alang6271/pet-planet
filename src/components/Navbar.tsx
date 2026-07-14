import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

/**
 * 顶部导航栏
 * 透明背景，滚动后变为半透明毛玻璃效果
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-space-deepest/80 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🪐</span>
            <span className="font-serif text-lg font-medium tracking-wide text-ink-primary">
              宠物星球
            </span>
            <span className="text-xs text-ink-muted font-sans tracking-widest uppercase hidden sm:inline">
              Pet-Planet
            </span>
          </Link>

          {/* 导航链接 */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-sm text-ink-secondary hover:text-ink-primary transition-colors duration-300"
            >
              首页
            </Link>
            <Link
              to="/planets"
              className="text-sm text-ink-secondary hover:text-ink-primary transition-colors duration-300"
            >
              星球
            </Link>
            <a
              href="#features"
              className="text-sm text-ink-secondary hover:text-ink-primary transition-colors duration-300 hidden sm:inline"
            >
              功能
            </a>
            <Link
              to="/planets"
              className="text-sm text-gold hover:text-gold-light transition-colors duration-300 flex items-center gap-1"
            >
              <span>创建星球</span>
              <span className="text-xs">→</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

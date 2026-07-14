import { Link } from "react-router-dom";

/**
 * 行动号召区
 * 引导用户开始创建纪念星球
 */
export default function CtaSection() {
  return (
    <section className="relative py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        {/* 装饰性星光 */}
        <div className="text-4xl mb-6 animate-twinkle">✨</div>

        <h2 className="font-serif text-3xl sm:text-5xl font-light text-ink-primary mb-4 leading-tight">
          每一颗星
          <br />
          <span className="text-gradient-gold font-medium">都是一段不舍的爱</span>
        </h2>

        <p className="text-base text-ink-secondary leading-relaxed mb-8 max-w-xl mx-auto">
          如果 TA 已经回到了星河之中
          <br />
         不如在这里，为 TA 点亮一颗永恒的星
        </p>

        <Link
          to="/planets"
          className="btn-capsule bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-space-deepest font-semibold glow-gold text-lg px-10 py-4"
        >
          开始创建纪念星球
        </Link>
      </div>
    </section>
  );
}

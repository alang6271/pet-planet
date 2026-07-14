import { Camera, Globe2, Flame } from "lucide-react";

/**
 * 功能展示区
 * 交替图文布局，展示三大核心功能
 */
const features = [
  {
    icon: Camera,
    emoji: "📷",
    title: "宠物记忆档案",
    subtitle: "Digital Memory Archive",
    description:
      "上传照片、记录文字，打造专属的数字时光胶囊。时间线式展示，分类管理，系统化保存与爱宠的点点滴滴，让回忆不再随时间模糊。",
    highlights: ["照片上传与自动压缩", "时间线浏览", "分类管理"],
    gradient: "from-amber-500/20 to-orange-500/5",
  },
  {
    icon: Globe2,
    emoji: "🪐",
    title: "虚拟纪念星球",
    subtitle: "Memorial Planet",
    description:
      "为 TA 创建一颗独一无二的 3D 虚拟星球。自定义颜色、纹理、光环与装饰，每颗星球都承载着一段独特的宠物情缘，点击即可进入专属空间。",
    highlights: ["3D 星球可视化", "外观自定义", "宇宙场景探索"],
    gradient: "from-blue-500/20 to-indigo-500/5",
  },
  {
    icon: Flame,
    emoji: "🕯️",
    title: "点蜡烛",
    subtitle: "Light a Candle",
    description:
      "为 TA 点亮一支蜡烛，寄托永恒的思念。柔和的火焰动画，仪式化的纪念行为，有助于悲伤处理与心理愈合，让哀思有了温柔的安放。",
    highlights: ["蜡烛动画效果", "寄语附言", "累计计数"],
    gradient: "from-rose-500/20 to-pink-500/5",
  },
];

export default function FeatureSection() {
  return (
    <section id="features" className="relative py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-12">
          <p className="text-sm tracking-[0.3em] text-gold uppercase font-sans mb-4">
            Core Features
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-ink-primary">
            三大核心功能
          </h2>
        </div>

        {/* 功能列表 */}
        <div className="space-y-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isReversed = index % 2 === 1;

            return (
              <div
                key={index}
                className={`flex flex-col ${
                  isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
                } items-center gap-8 lg:gap-12`}
              >
                {/* 视觉区域 */}
                <div className="flex-1 w-full">
                  <div
                    className={`aspect-square max-w-sm mx-auto rounded-[2.5rem] border border-white/10 bg-gradient-to-br ${feature.gradient} flex items-center justify-center relative overflow-hidden`}
                  >
                    {/* 装饰性光晕 */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-white/10 blur-3xl"></div>
                      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-gold/10 blur-3xl"></div>
                    </div>

                    {/* 图标 */}
                    <div className="relative z-10 text-center">
                      <div className="text-7xl mb-4">{feature.emoji}</div>
                      <Icon
                        className="w-10 h-10 text-ink-secondary mx-auto"
                        strokeWidth={1}
                      />
                    </div>
                  </div>
                </div>

                {/* 文字区域 */}
                <div className="flex-1 w-full">
                  <p className="text-xs tracking-[0.2em] text-ink-muted uppercase font-sans mb-3">
                    {feature.subtitle}
                  </p>
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium text-ink-primary mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-base text-ink-secondary leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* 亮点列表 */}
                  <ul className="space-y-3">
                    {feature.highlights.map((highlight, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-sm text-ink-secondary"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

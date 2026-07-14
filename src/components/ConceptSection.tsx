import { Infinity as InfinityIcon, Globe2, Heart } from "lucide-react";

/**
 * 产品理念区
 * 三栏布局展示核心理念
 */
const concepts = [
  {
    icon: InfinityIcon,
    title: "永恒的陪伴",
    description: "时间会带走一切，但带不走爱。在这里，每一份陪伴都被永远铭记，成为星河中不灭的光。",
  },
  {
    icon: Globe2,
    title: "专属的星球",
    description: "每一只毛孩子都拥有独一无二的星球。自定义外观与装饰，让这颗星成为 TA 独有的印记。",
  },
  {
    icon: Heart,
    title: "温暖的告别",
    description: "点一支蜡烛，写一段寄语。仪式化的纪念，让悲伤有了安放之处，让告别多一份温柔。",
  },
];

export default function ConceptSection() {
  return (
    <section id="concept" className="relative py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-ink-primary mb-4">
            在浩瀚宇宙中，为 TA 留一颗星
          </h2>
          <p className="text-ink-secondary text-base max-w-2xl mx-auto">
            宠物星球不仅是一个平台，更是一座连接记忆与思念的桥梁
          </p>
        </div>

        {/* 三栏理念 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {concepts.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-gold/20 transition-all duration-500"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/10 mb-4">
                  <Icon className="w-6 h-6 text-gold" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl font-medium text-ink-primary mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { Trash2, Calendar, ImageOff } from "lucide-react";
import type { Memory } from "../../shared/types";

interface MemoryTimelineProps {
  memories: Memory[];
  onDelete: (id: string) => void;
}

// 分类配置
const categoryConfig: Record<
  Memory["category"],
  { label: string; color: string }
> = {
  baby: { label: "幼年", color: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
  adult: { label: "成年", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  funny: { label: "趣事", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  daily: { label: "日常", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  farewell: { label: "告别", color: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
};

/**
 * 格式化日期
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

/**
 * 记忆档案时间线
 * 参考QQ空间时光轴的纵向时间线设计
 */
export default function MemoryTimeline({
  memories,
  onDelete,
}: MemoryTimelineProps) {
  if (memories.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
          <ImageOff className="w-7 h-7 text-ink-muted" strokeWidth={1.5} />
        </div>
        <p className="text-sm text-ink-secondary mb-1">还没有留下回忆</p>
        <p className="text-xs text-ink-muted">
          点击「添加记忆」，记录与 TA 的点点滴滴
        </p>
      </div>
    );
  }

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* 中央时间轴线 */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent md:-translate-x-1/2" />

      <div className="space-y-8">
        {memories.map((memory, index) => {
          const cat = categoryConfig[memory.category];
          const isLeft = index % 2 === 0;

          return (
            <div
              key={memory.id}
              className={`relative flex items-start gap-6 ${
                isLeft ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              {/* 时间线节点 */}
              <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10 mt-6">
                <div className="w-3 h-3 rounded-full bg-gold ring-4 ring-space-deepest" />
              </div>

              {/* 左侧占位（桌面端） */}
              <div className="hidden md:block flex-1" />

              {/* 记忆卡片 */}
              <div className="flex-1 ml-12 md:ml-0">
                <div className="group rounded-2xl border border-white/10 bg-space-dark/60 backdrop-blur-sm p-5 hover:border-gold/30 hover:bg-space-dark/80 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(245,185,66,0.08)] transition-all duration-300">
                  {/* 日期 + 分类 */}
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    {memory.memory_date && (
                      <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                        <Calendar className="w-3 h-3" />
                        {formatDate(memory.memory_date)}
                      </div>
                    )}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${cat.color}`}
                    >
                      {cat.label}
                    </span>
                  </div>

                  {/* 文字内容 */}
                  {memory.content && (
                    <p className="text-sm text-ink-primary leading-relaxed mb-3 whitespace-pre-wrap">
                      {memory.content}
                    </p>
                  )}

                  {/* 照片网格 */}
                  {memory.image_paths.length > 0 && (
                    <div
                      className={`grid gap-2 ${
                        memory.image_paths.length === 1
                          ? "grid-cols-1"
                          : memory.image_paths.length === 2
                          ? "grid-cols-2"
                          : "grid-cols-3"
                      }`}
                    >
                      {memory.image_paths.map((imgPath, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-lg overflow-hidden bg-space-mid"
                        >
                          <img
                            src={imgPath}
                            alt={`记忆照片 ${i + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 删除按钮（悬停显示） */}
                  <button
                    onClick={() => onDelete(memory.id)}
                    className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-ink-muted hover:text-rose-400"
                  >
                    <Trash2 className="w-3 h-3" />
                    删除
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

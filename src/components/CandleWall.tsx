import { useState } from "react";
import { Flame, X, Loader2, Heart } from "lucide-react";
import { lightCandle } from "@/api/candles";
import type { Candle } from "../../shared/types";
import Modal from "./Modal";

interface CandleWallProps {
  petId: string;
  candles: Candle[];
  onLit: (candle: Candle) => void;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 30) return `${days} 天前`;
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function CandleFlame({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeMap = {
    sm: { w: "w-3", h: "h-4", glow: "w-8 h-8" },
    md: { w: "w-4", h: "h-6", glow: "w-12 h-12" },
    lg: { w: "w-6", h: "h-9", glow: "w-20 h-20" },
  };
  const s = sizeMap[size];

  return (
    <div className="relative flex items-center justify-center">
      <div className={`absolute ${s.glow} rounded-full bg-amber-400/20 blur-xl animate-candle-glow`} />
      <div className={`absolute ${s.glow} rounded-full bg-orange-300/10 blur-2xl animate-candle-glow-slow`} />
      <div className="relative">
        <div className={`${s.w} ${size === "lg" ? "h-9" : size === "md" ? "h-6" : "h-4"} relative`}>
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 animate-candle-flicker" style={{ borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%" }} />
          <div className="absolute inset-[15%] rounded-full bg-gradient-to-t from-amber-300 via-yellow-200 to-white animate-candle-flicker-inner" style={{ borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%" }} />
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-white/80 blur-[1px]" />
        </div>
      </div>
    </div>
  );
}

function CandleStick({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const heightMap = { sm: "h-8", md: "h-12", lg: "h-20" };
  const widthMap = { sm: "w-2", md: "w-3", lg: "w-5" };

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative">
        <div className={`${widthMap[size]} ${heightMap[size]} rounded-sm bg-gradient-to-b from-amber-50 via-amber-100 to-amber-200 shadow-[inset_2px_0_4px_rgba(255,255,255,0.5),inset_-2px_0_4px_rgba(217,119,6,0.2)]`} />
        <div className={`absolute -top-1 left-1/2 -translate-x-1/2 ${widthMap[size]} h-1.5 rounded-t-sm bg-amber-600/40`} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1.5 bg-gray-700 rounded-full" />
      </div>
      <div className={`${size === "lg" ? "w-10 h-2.5" : size === "md" ? "w-6 h-2" : "w-4 h-1.5"} rounded-full bg-gradient-to-b from-amber-700/80 to-amber-900/80 -mt-0.5 shadow-md`} />
    </div>
  );
}

export default function CandleWall({
  petId,
  candles,
  onLit,
}: CandleWallProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCandle, setSelectedCandle] = useState<Candle | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLight = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const candle = await lightCandle(petId, {
        lighter_name: name.trim() || undefined,
        message: message.trim() || undefined,
      });
      onLit(candle);
      setName("");
      setMessage("");
      setModalOpen(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setName("");
    setMessage("");
    setError("");
    setModalOpen(false);
  };

  const openDetail = (candle: Candle) => {
    setSelectedCandle(candle);
    setDetailOpen(true);
  };

  return (
    <div>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-serif text-2xl font-light text-ink-primary">
              蜡烛墙
            </h3>
          </div>
          <p className="text-sm text-ink-secondary">
            已有 <span className="text-amber-400 font-medium">{candles.length}</span> 份思念在此汇聚
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-capsule bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all"
        >
          <Flame className="w-4 h-4 mr-1.5" />
          点亮蜡烛
        </button>
      </div>

      {/* 蜡烛展示区 */}
      {candles.length === 0 ? (
        <div className="relative rounded-3xl border border-white/[0.06] bg-gradient-to-b from-amber-500/[0.03] to-transparent p-16 text-center overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-amber-500/5 blur-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/[0.07] mb-6">
              <span className="text-4xl">🕯️</span>
            </div>
            <h4 className="font-serif text-xl text-ink-primary mb-3">
              这里还没有烛光
            </h4>
            <p className="text-sm text-ink-secondary mb-8 max-w-sm mx-auto leading-relaxed">
              每一支被点亮的蜡烛，都是一份温暖的牵挂。<br />
              为 TA 点燃第一束光，让思念在星河中延续。
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-capsule bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white text-sm shadow-lg shadow-amber-500/20"
            >
              <Flame className="w-4 h-4 mr-1.5" />
              点亮第一支蜡烛
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-2/3 h-32 rounded-full bg-amber-500/[0.08] blur-3xl pointer-events-none" />
          <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {candles.map((candle, index) => (
              <div
                key={candle.id}
                onClick={() => openDetail(candle)}
                className="group relative rounded-2xl border border-white/[0.05] bg-space-dark/30 backdrop-blur-sm p-6 text-center cursor-pointer hover:border-amber-500/20 hover:bg-space-dark/50 transition-all duration-500 hover:-translate-y-1"
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-amber-400/10 blur-2xl" />
                </div>

                <div className="relative flex flex-col items-center mb-5">
                  <div className="relative -mb-1 z-10">
                    <CandleFlame size="sm" />
                  </div>
                  <CandleStick size="sm" />
                </div>

                <div className="relative z-10">
                  <p className="text-sm font-medium text-ink-primary truncate mb-1.5">
                    {candle.lighter_name || "匿名"}
                  </p>
                  {candle.message && (
                    <p className="text-xs text-ink-muted line-clamp-2 mb-2 leading-relaxed">
                      "{candle.message}"
                    </p>
                  )}
                  <p className="text-[10px] text-ink-muted/60">
                    {formatTime(candle.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 点蜡烛模态框 */}
      <Modal open={modalOpen} onClose={closeModal}>
        <div className="relative w-full max-w-md rounded-3xl border border-amber-500/10 bg-gradient-to-b from-space-dark to-space-deepest overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl" />

            <button
              onClick={closeModal}
              className="absolute top-5 right-5 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-ink-muted hover:text-ink-primary transition-all"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative p-8 pb-6">
              <div className="text-center mb-8">
                <div className="relative inline-flex flex-col items-center mb-6">
                  <div className="relative -mb-2 z-10">
                    <CandleFlame size="lg" />
                  </div>
                  <CandleStick size="lg" />
                </div>
                <h2 className="font-serif text-2xl font-light text-ink-primary mb-2">
                  为 TA 点亮一支蜡烛
                </h2>
                <p className="text-sm text-ink-secondary">
                  让温暖的光，承载你的思念
                </p>
              </div>

              <form onSubmit={handleLight} className="space-y-4">
                <div>
                  <label className="block text-xs text-ink-muted mb-2 ml-1">你的名字</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="留个名字吧（可不填）"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-ink-primary placeholder-ink-muted/40 focus:outline-none focus:border-amber-500/30 focus:bg-white/[0.06] transition-all"
                    maxLength={20}
                  />
                </div>
                <div>
                  <label className="block text-xs text-ink-muted mb-2 ml-1">想说的话</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="一句寄语，一缕烛光..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-ink-primary placeholder-ink-muted/40 focus:outline-none focus:border-amber-500/30 focus:bg-white/[0.06] transition-all resize-none"
                    maxLength={100}
                  />
                </div>

                {error && (
                  <p className="text-sm text-rose-400 bg-rose-500/10 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-capsule w-full bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-medium shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Flame className="w-4 h-4" />
                  )}
                  {submitting ? "点亮中..." : "点亮蜡烛"}
                </button>
              </form>
            </div>
        </div>
      </Modal>

      {/* 蜡烛详情模态框 */}
      <Modal open={detailOpen && !!selectedCandle} onClose={() => setDetailOpen(false)}>
        <div className="relative w-full max-w-sm rounded-3xl border border-amber-500/10 bg-gradient-to-b from-space-dark to-space-deepest overflow-hidden">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-amber-400/15 blur-3xl" />
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full bg-orange-500/5 blur-3xl" />

            <button
              onClick={() => setDetailOpen(false)}
              className="absolute top-5 right-5 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-ink-muted hover:text-ink-primary transition-all"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative p-8 pb-6 text-center">
              <div className="relative inline-flex flex-col items-center mb-8">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-amber-400/10 blur-2xl animate-pulse" />
                <div className="relative -mb-2 z-10">
                  <CandleFlame size="md" />
                </div>
                <CandleStick size="md" />
              </div>

              <p className="text-xs text-amber-400/70 tracking-widest uppercase mb-2">
                来自 {selectedCandle.lighter_name || "匿名"}
              </p>
              <h3 className="font-serif text-lg font-light text-ink-primary mb-6">
                {formatTime(selectedCandle.created_at)} 点亮
              </h3>

              {selectedCandle.message ? (
                <div className="relative rounded-2xl bg-white/[0.03] border border-white/[0.05] p-5 mb-6">
                  <div className="absolute -top-2.5 left-6 text-amber-400/40 text-2xl font-serif">"</div>
                  <p className="font-serif text-base text-ink-primary leading-relaxed italic">
                    {selectedCandle.message}
                  </p>
                  <div className="absolute -bottom-4 right-6 text-amber-400/40 text-2xl font-serif rotate-180">"</div>
                </div>
              ) : (
                <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-5 mb-6">
                  <p className="text-sm text-ink-muted">
                    一支静默的蜡烛，无声胜有声
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-ink-muted">
                <Heart className="w-4 h-4 text-rose-400/60" />
                <span>愿这束光，照亮 TA 的归途</span>
              </div>
            </div>
        </div>
      </Modal>
    </div>
  );
}

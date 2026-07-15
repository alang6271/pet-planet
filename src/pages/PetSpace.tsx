import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Loader2,
  AlertCircle,
  Calendar,
  Heart,
  Image,
  Flame,
  Globe,
  Trash2,
} from "lucide-react";
import StarField from "@/components/StarField";
import MiniPlanetView from "@/three/MiniPlanetView";
import MemoryTimeline from "@/components/MemoryTimeline";
import AddMemoryModal from "@/components/AddMemoryModal";
import CandleWall from "@/components/CandleWall";
import CountUp from "@/components/CountUp";
import { getPet, deletePet } from "@/api/pets";
import { getMemories, deleteMemory } from "@/api/memories";
import { getCandles } from "@/api/candles";
import type { Pet, Memory, Candle } from "../../shared/types";

type TabKey = "memories" | "candles" | "planet";

/**
 * 格式化日期
 */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

/**
 * 计算陪伴天数（返回数值，用于计数动画）
 */
function computeCompanionDays(
  birth: string | null,
  death: string | null
): number {
  if (!birth) return 0;
  const start = new Date(birth);
  const end = death ? new Date(death) : new Date();
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  const diff = end.getTime() - start.getTime();
  if (diff < 0) return 0;
  return Math.floor(diff / 86400000);
}

/**
 * 宠物空间页
 * 沉浸式全屏布局 + 氛围光 + 进入动画 + 微交互
 */
export default function PetSpace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [memoryModalOpen, setMemoryModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("memories");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
  } | null>(null);

  // 获取所有数据
  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const [petData, memoriesData, candlesData] = await Promise.all([
        getPet(id),
        getMemories(id),
        getCandles(id),
      ]);
      setPet(petData);
      setMemories(memoriesData);
      setCandles(candlesData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 更新 Tab 指示器位置
  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el) {
      setIndicatorStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
      });
    }
  }, [activeTab, loading]);

  // 添加记忆
  const handleMemoryCreated = (memory: Memory) => {
    setMemories((prev) => [memory, ...prev]);
    setMemoryModalOpen(false);
  };

  // 删除记忆
  const handleMemoryDelete = async (memoryId: string) => {
    try {
      await deleteMemory(memoryId);
      setMemories((prev) => prev.filter((m) => m.id !== memoryId));
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // 点亮蜡烛
  const handleCandleLit = (candle: Candle) => {
    setCandles((prev) => [candle, ...prev]);
  };

  // 熄灭蜡烛（删除）
  const handleCandleDelete = (candleId: string) => {
    setCandles((prev) => prev.filter((c) => c.id !== candleId));
  };

  // 删除星球
  const handleDelete = async () => {
    if (!pet || deleteConfirmText !== pet.name) return;
    setDeleting(true);
    try {
      await deletePet(pet.id);
      navigate("/planets");
    } catch (err) {
      setError((err as Error).message);
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const openDeleteModal = () => {
    setDeleteConfirmText("");
    setDeleteModalOpen(true);
  };

  // 加载中
  if (loading) {
    return (
      <>
        <StarField />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-4" />
            <p className="text-sm text-ink-secondary">正在进入 TA 的空间...</p>
          </div>
        </div>
      </>
    );
  }

  // 加载失败
  if (error || !pet) {
    return (
      <>
        <StarField />
        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
            <p className="text-sm text-ink-secondary mb-4">
              {error || "未找到这个宠物空间"}
            </p>
            <Link
              to="/planets"
              className="btn-capsule border border-gold/50 text-gold hover:bg-gold/10 text-sm"
            >
              返回星球
            </Link>
          </div>
        </div>
      </>
    );
  }

  const companionDays = computeCompanionDays(pet.birth_date, pet.death_date);
  const planetColor = pet.planet_config.color;

  const tabs: {
    key: TabKey;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      key: "memories",
      label: "记忆档案",
      icon: <Image className="w-4 h-4" />,
      count: memories.length,
    },
    {
      key: "candles",
      label: "蜡烛墙",
      icon: <Flame className="w-4 h-4" />,
      count: candles.length,
    },
    {
      key: "planet",
      label: "星球信息",
      icon: <Globe className="w-4 h-4" />,
    },
  ];

  return (
    <>
      <StarField />
      <div className="relative z-10 min-h-screen">
        {/* === 全屏氛围光背景 === */}
        <div
          className="fixed inset-0 pointer-events-none animate-ambient-breath"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${planetColor}33 0%, ${planetColor}11 30%, transparent 60%)`,
          }}
        />
        {/* 顶部星球色光晕 */}
        <div
          className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[120px] opacity-20 pointer-events-none"
          style={{ backgroundColor: planetColor }}
        />

        {/* 顶部导航（固定悬浮） */}
        <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 pointer-events-none">
          <Link
            to="/planets"
            className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-ink-secondary hover:text-ink-primary hover:bg-white/10 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回</span>
          </Link>
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={openDeleteModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all text-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">删除星球</span>
            </button>
          </div>
        </div>

        {/* === 头部：星球 + 信息 === */}
        <div className="relative max-w-3xl mx-auto px-6 pt-20 pb-10 text-center">
          {/* 星球头像（缩放淡入） */}
          <div className="animate-planet-zoom-in w-36 h-36 md:w-44 md:h-44 mx-auto mb-8">
            <MiniPlanetView config={pet.planet_config} />
          </div>

          {/* 名字（延迟淡入） */}
          <h1
            className="animate-space-fade-up font-serif text-4xl md:text-5xl font-medium text-ink-primary mb-2"
            style={{ animationDelay: "0.3s" }}
          >
            {pet.name}
          </h1>

          {/* 品种 */}
          {pet.species && (
            <p
              className="animate-space-fade-up text-sm text-ink-secondary mb-3"
              style={{ animationDelay: "0.4s" }}
            >
              {pet.species}
            </p>
          )}

          {/* 寄语 */}
          {pet.epitaph && (
            <p
              className="animate-space-fade-up text-base text-gold italic leading-relaxed max-w-xl mx-auto mb-8"
              style={{ animationDelay: "0.5s" }}
            >
              "{pet.epitaph}"
            </p>
          )}

          {/* 数据条（延迟淡入） */}
          <div
            className="animate-space-fade-up flex items-center justify-center gap-8 py-6 border-y border-white/5"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="text-center">
              <p className="text-2xl font-serif text-ink-primary">
                <CountUp end={memories.length} delay={700} />
              </p>
              <p className="text-xs text-ink-muted mt-1">回忆</p>
            </div>
            <div className="w-px h-10 bg-white/5" />
            <div className="text-center">
              <p className="text-2xl font-serif text-gold">
                <CountUp end={candles.length} delay={900} />
              </p>
              <p className="text-xs text-ink-muted mt-1">蜡烛</p>
            </div>
            {companionDays > 0 && (
              <>
                <div className="w-px h-10 bg-white/5" />
                <div className="text-center">
                  <p className="text-2xl font-serif text-ink-primary">
                    <CountUp end={companionDays} delay={1100} duration={1800} />
                  </p>
                  <p className="text-xs text-ink-muted mt-1">陪伴天数</p>
                </div>
              </>
            )}
          </div>

          {/* 生卒日期 */}
          {(pet.birth_date || pet.death_date) && (
            <div
              className="animate-space-fade-up flex items-center justify-center gap-4 text-xs text-ink-muted mt-6"
              style={{ animationDelay: "0.7s" }}
            >
              {pet.birth_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(pet.birth_date)}</span>
                </div>
              )}
              {pet.birth_date && pet.death_date && (
                <span className="text-ink-muted/50">—</span>
              )}
              {pet.death_date && (
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3 h-3 text-rose-400/60" />
                  <span>{formatDate(pet.death_date)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* === Tab 导航栏（滑动指示器） === */}
        <div
          className="animate-space-fade-up max-w-3xl mx-auto px-6 sticky top-16 z-20 py-3"
          style={{ animationDelay: "0.8s" }}
        >
          <div className="relative flex items-center justify-center gap-1 bg-white/[0.03] backdrop-blur-md rounded-full p-1 border border-white/5">
            {/* 滑动指示器 */}
            {indicatorStyle && (
              <div
                className="absolute top-1 bottom-1 rounded-full bg-white/10 transition-all duration-300 ease-out"
                style={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                }}
              />
            )}
            {tabs.map((tab) => (
              <button
                key={tab.key}
                ref={(el) => {
                  tabRefs.current[tab.key] = el;
                }}
                onClick={() => setActiveTab(tab.key)}
                className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors duration-300 ${
                  activeTab === tab.key
                    ? "text-ink-primary"
                    : "text-ink-muted hover:text-ink-secondary"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full transition-colors duration-300 ${
                      activeTab === tab.key
                        ? "bg-gold/20 text-gold"
                        : "bg-white/5 text-ink-muted"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* === Tab 内容区 === */}
        <div className="max-w-3xl mx-auto px-6 mt-8 pb-16">
          {/* 记忆档案 */}
          {activeTab === "memories" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs text-ink-muted">
                  共 {memories.length} 条记忆 · 记录与 TA 的点点滴滴
                </p>
                <button
                  onClick={() => setMemoryModalOpen(true)}
                  className="btn-capsule bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-space-deepest font-semibold glow-gold text-xs hover:scale-105 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  添加记忆
                </button>
              </div>
              <MemoryTimeline
                memories={memories}
                onDelete={handleMemoryDelete}
              />
            </div>
          )}

          {/* 蜡烛墙 */}
          {activeTab === "candles" && (
            <CandleWall
              petId={pet.id}
              candles={candles}
              onLit={handleCandleLit}
              onDelete={handleCandleDelete}
            />
          )}

          {/* 星球信息 */}
          {activeTab === "planet" && (
            <div className="space-y-6">
              {/* 星球大图 */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-8">
                <div className="w-40 h-40 mx-auto mb-6">
                  <MiniPlanetView config={pet.planet_config} />
                </div>
                <h3 className="text-center font-serif text-lg text-ink-primary mb-1">
                  {pet.name} 的星球
                </h3>
                <p className="text-center text-xs text-ink-muted mb-6">
                  每一颗星都是独一无二的
                </p>

                {/* 星球属性 */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="rounded-xl bg-white/[0.03] p-4 text-center hover:bg-white/[0.06] transition-colors">
                    <p className="text-xs text-ink-muted mb-2">星球颜色</p>
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full ring-1 ring-white/20"
                        style={{ backgroundColor: planetColor }}
                      />
                      <span className="text-sm text-ink-primary">
                        {planetColor}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] p-4 text-center hover:bg-white/[0.06] transition-colors">
                    <p className="text-xs text-ink-muted mb-2">纹理风格</p>
                    <span className="text-sm text-ink-primary">
                      {pet.planet_config.texture === "smooth" && "光滑"}
                      {pet.planet_config.texture === "stripes" && "条纹"}
                      {pet.planet_config.texture === "spots" && "斑点"}
                      {pet.planet_config.texture === "nebula" && "星云"}
                    </span>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] p-4 text-center col-span-2 hover:bg-white/[0.06] transition-colors">
                    <p className="text-xs text-ink-muted mb-2">光环</p>
                    <span className="text-sm text-ink-primary">
                      {pet.planet_config.hasRing ? "💫 已开启" : "未开启"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 寄语卡 */}
              {pet.epitaph && (
                <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-8 text-center">
                  <p className="text-2xl mb-3">✨</p>
                  <p className="font-serif text-lg text-gold italic leading-relaxed">
                    "{pet.epitaph}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部 */}
        <footer className="text-center pb-10 pt-6 border-t border-white/5">
          <p className="text-xs text-ink-muted">
            愿 TA 在星河之中，永远闪耀 ✨
          </p>
        </footer>

        {/* 添加记忆模态框 */}
        <AddMemoryModal
          open={memoryModalOpen}
          petId={pet.id}
          onClose={() => setMemoryModalOpen(false)}
          onCreated={handleMemoryCreated}
        />

        {/* 删除星球确认弹窗 */}
        {deleteModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            onClick={() => !deleting && setDeleteModalOpen(false)}
          >
            <div className="absolute inset-0 bg-space-deepest/80 backdrop-blur-sm animate-modal-overlay-in" />
            <div
              className="relative w-full max-w-md rounded-3xl border border-rose-500/20 bg-space-dark p-8 text-center animate-modal-zoom-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-rose-500/10 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-rose-400" />
              </div>
              <h3 className="font-serif text-2xl text-ink-primary mb-3">
                确定要让这颗星熄灭吗？
              </h3>
              <p className="text-sm text-ink-secondary mb-2">
                删除后，TA 的所有记忆、蜡烛都将一起消散
              </p>
              <p className="text-sm text-rose-400/80 mb-6">
                此操作无法撤销
              </p>

              <div className="mb-6 text-left">
                <label className="block text-xs text-ink-muted mb-2">
                  请输入 <span className="text-rose-400 font-medium">{pet.name}</span> 以确认删除
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-space-mid border border-white/10 text-ink-primary placeholder-ink-muted focus:outline-none focus:border-rose-500/50 transition-colors text-center font-serif text-lg"
                  placeholder={pet.name}
                  disabled={deleting}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleting}
                  className="btn-capsule border border-white/10 text-ink-secondary hover:bg-white/5 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  再想想
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting || deleteConfirmText !== pet.name}
                  className="btn-capsule bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-400 hover:to-rose-500 text-white font-semibold flex-1 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {deleting ? "正在删除..." : "确认删除"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

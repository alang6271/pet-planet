import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Sparkles, Loader2, AlertCircle } from "lucide-react";
import UniverseScene from "@/three/UniverseScene";
import CreatePlanetModal from "@/components/CreatePlanetModal";
import PlanetSearchPanel from "@/components/PlanetSearchPanel";
import { getPets } from "@/api/pets";
import type { Pet } from "../../shared/types";

/**
 * 星球页（宇宙视图）
 * 3D 宇宙场景中漂浮着各宠物的纪念星球，可点击进入宠物空间
 */
export default function Planets() {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [targetPet, setTargetPet] = useState<Pet | null>(null);

  // 获取宠物列表
  const fetchPets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPets();
      setPets(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const handlePlanetClick = (pet: Pet) => {
    navigate(`/pets/${pet.id}`);
  };

  const handleFocusPlanet = (pet: Pet) => {
    setTargetPet(pet);
    setTimeout(() => setTargetPet(null), 1000);
  };

  const handleCreated = (pet: Pet) => {
    setPets((prev) => [pet, ...prev]);
    setModalOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-space-deepest animate-page-fade-in">
      {/* 顶部栏 */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-ink-secondary hover:text-ink-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回首页</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xl">🪐</span>
          <span className="font-serif text-base text-ink-primary">宠物星球</span>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-capsule bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-space-deepest font-semibold glow-gold text-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          创建星球
        </button>
      </header>

      {/* 主内容区 */}
      <div className="relative h-screen w-full">
        {loading ? (
          // 加载中
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-4" />
              <p className="text-sm text-ink-secondary">正在召唤星辰...</p>
            </div>
          </div>
        ) : error ? (
          // 加载失败
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="text-center max-w-sm">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
              <p className="text-sm text-ink-secondary mb-4">{error}</p>
              <button
                onClick={fetchPets}
                className="btn-capsule border border-gold/50 text-gold hover:bg-gold/10 text-sm"
              >
                重新加载
              </button>
            </div>
          </div>
        ) : pets.length === 0 ? (
          // 空状态
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gold/10 mb-8 animate-float-slow">
                <Sparkles className="w-10 h-10 text-gold" strokeWidth={1.5} />
              </div>
              <h2 className="font-serif text-3xl font-light text-ink-primary mb-4">
                宇宙尚未点亮
              </h2>
              <p className="text-sm text-ink-secondary leading-relaxed mb-8">
                点亮第一颗星，开始永恒的陪伴
                <br />
                每一颗星，都代表着一段被永远铭记的爱
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="btn-capsule bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-space-deepest font-semibold glow-gold"
              >
                <Plus className="w-4 h-4 mr-1" />
                点亮第一颗星
              </button>
            </div>
          </div>
        ) : (
          // 3D 宇宙场景
          <UniverseScene pets={pets} onPlanetClick={handlePlanetClick} hideLabels={modalOpen || searchOpen} targetPet={targetPet} />
        )}
      </div>

      {/* 底部提示（有星球时显示） */}
      {!loading && !error && pets.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="px-4 py-2 rounded-full bg-space-deepest/60 backdrop-blur-md border border-white/5 text-xs text-ink-muted">
            拖拽旋转视角 · 滚轮缩放 · 点击星球进入空间
          </div>
        </div>
      )}

      {/* 星球数量指示器 + 搜索按钮 */}
      {!loading && !error && pets.length > 0 && (
        <div className="absolute top-20 left-6 z-20 flex items-center gap-3">
          <div className="px-4 py-2 rounded-full bg-space-deepest/60 backdrop-blur-md border border-white/5 text-xs text-ink-secondary">
            <span className="text-gold">{pets.length}</span> 颗星球正在闪耀
          </div>
          <PlanetSearchPanel
            pets={pets}
            open={searchOpen}
            onOpenChange={setSearchOpen}
            onFocusPlanet={handleFocusPlanet}
            onSelectPlanet={handlePlanetClick}
            focusedPetId={targetPet?.id || null}
          />
        </div>
      )}

      {/* 创建模态框 */}
      <CreatePlanetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}

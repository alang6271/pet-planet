import { useState, useMemo } from "react";
import { Search, Star, X } from "lucide-react";
import type { Pet } from "../../shared/types";
import Modal from "./Modal";

interface PlanetSearchPanelProps {
  pets: Pet[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFocusPlanet: (pet: Pet) => void;
  onSelectPlanet: (pet: Pet) => void;
  focusedPetId?: string | null;
}

export default function PlanetSearchPanel({
  pets,
  open,
  onOpenChange,
  onFocusPlanet,
  onSelectPlanet,
  focusedPetId,
}: PlanetSearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPets = useMemo(() => {
    if (!searchQuery.trim()) return pets;
    const query = searchQuery.toLowerCase();
    return pets.filter(
      (pet) =>
        pet.name.toLowerCase().includes(query) ||
        pet.species.toLowerCase().includes(query)
    );
  }, [pets, searchQuery]);

  return (
    <>
      {/* 搜索触发按钮 */}
      <button
        onClick={() => onOpenChange(true)}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-space-deepest/60 backdrop-blur-md border border-white/10 hover:border-gold/30 text-ink-secondary hover:text-gold transition-all"
        title="搜索星球"
      >
        <Search className="w-4 h-4" />
      </button>

      {/* 搜索面板 */}
      <Modal open={open} onClose={() => onOpenChange(false)}>
        <div className="relative w-full max-w-lg rounded-3xl liquid-glass flex flex-col overflow-hidden">
          {/* 关闭按钮 */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-ink-muted hover:text-ink-primary transition-all"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>

            {/* 标题 */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-gold" />
                <h2 className="font-serif text-lg font-medium text-ink-primary">
                  寻找星球
                </h2>
              </div>
              <p className="text-xs text-ink-muted mt-1">
                输入名字或品种，快速定位 TA 的星球
              </p>
            </div>

            {/* 搜索框 */}
            <div className="px-6 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索名字或品种..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-space-deepest/50 border border-white/10 text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-gold/50 focus:shadow-[0_0_16px_rgba(245,185,66,0.12)] transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* 分隔线 */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* 星球列表 */}
            <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[400px]">
              {filteredPets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-space-mid/30 mb-4">
                    <Star className="w-8 h-8 text-ink-muted" strokeWidth={1} />
                  </div>
                  <p className="text-sm text-ink-secondary">
                    {searchQuery ? "未找到匹配的星球" : "还没有星球"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPets.map((pet) => (
                    <button
                      key={pet.id}
                      onClick={() => {
                        onOpenChange(false);
                        onFocusPlanet(pet);
                        setTimeout(() => {
                          onSelectPlanet(pet);
                        }, 800);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group ${
                        focusedPetId === pet.id
                          ? "bg-gold/15 border border-gold/30"
                          : "bg-space-mid/30 border border-white/5 hover:border-white/15 hover:bg-space-mid/50"
                      }`}
                    >
                      {/* 星球颜色指示 */}
                      <div
                        className="w-8 h-8 rounded-full flex-shrink-0"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, ${pet.planet_config.color}, ${pet.planet_config.color}88)`,
                          boxShadow: `0 0 12px ${pet.planet_config.color}40`,
                        }}
                      />

                      {/* 信息 */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-ink-primary truncate">
                          {pet.name}
                        </p>
                        <p className="text-xs text-ink-muted truncate">
                          {pet.species || "未知品种"}
                        </p>
                      </div>

                      {/* 进入按钮 */}
                      <div
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all ${
                          focusedPetId === pet.id
                            ? "bg-gold/20 text-gold"
                            : "bg-space-deepest/50 text-ink-muted group-hover:text-ink-secondary"
                        }`}
                      >
                        <span>进入</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 底部提示 */}
            <div className="px-6 pb-4">
              <p className="text-xs text-ink-muted text-center">
                点击星球列表项可自动聚焦到对应星球
              </p>
            </div>
        </div>
      </Modal>
    </>
  );
}

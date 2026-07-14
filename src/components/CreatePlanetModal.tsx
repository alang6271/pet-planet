import { useState } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import { createPet } from "@/api/pets";
import type { Pet, PlanetConfig } from "../../shared/types";
import Modal from "./Modal";

interface CreatePlanetModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (pet: Pet) => void;
}

const colorPresets = [
  { name: "蜜桃暖橙", value: "#ffcba0" },
  { name: "奶油暖黄", value: "#ffe9a8" },
  { name: "樱花暖粉", value: "#ffb6d1" },
  { name: "玫瑰粉", value: "#f5b7c5" },
  { name: "薄荷绿", value: "#b5e8d5" },
  { name: "天空蓝", value: "#b5d9f0" },
  { name: "薰衣草", value: "#c8b6e2" },
  { name: "奶油白", value: "#fdf0d5" },
];

const textureOptions: { name: string; value: PlanetConfig["texture"] }[] = [
  { name: "光滑", value: "smooth" },
  { name: "条纹", value: "stripes" },
  { name: "斑点", value: "spots" },
  { name: "星云", value: "nebula" },
];

export default function CreatePlanetModal({
  open,
  onClose,
  onCreated,
}: CreatePlanetModalProps) {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [epitaph, setEpitaph] = useState("");
  const [color, setColor] = useState(colorPresets[0].value);
  const [texture, setTexture] = useState<PlanetConfig["texture"]>("smooth");
  const [hasRing, setHasRing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("请填写宠物名字");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const planetConfig: PlanetConfig = {
        color,
        texture,
        hasRing,
        decoration: "none",
      };
      const pet = await createPet({
        name: name.trim(),
        species: species.trim() || undefined,
        birth_date: birthDate || undefined,
        death_date: deathDate || undefined,
        epitaph: epitaph.trim() || undefined,
        planet_config: planetConfig,
      });
      onCreated(pet);
      setName("");
      setSpecies("");
      setBirthDate("");
      setDeathDate("");
      setEpitaph("");
      setColor(colorPresets[0].value);
      setTexture("smooth");
      setHasRing(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="relative w-full max-w-2xl max-h-[95vh] rounded-3xl liquid-glass flex flex-col overflow-hidden">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-ink-muted hover:text-ink-primary transition-all"
          aria-label="关闭"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 标题区 - 固定 */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-space-deepest" />
              </div>
              <div className="absolute -inset-2 rounded-full bg-gold/20 blur-xl animate-ambient-breath" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-semibold text-ink-primary">
                创建纪念星球
              </h2>
              <p className="text-sm text-ink-secondary">
                为 TA 点亮一颗永恒的星
              </p>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        </div>

        {/* 内容区 - 自适应高度，避免滚动 */}
        <div className="flex-1 overflow-visible px-6 pb-6">
          <div className="grid grid-cols-12 gap-5 items-start">
            {/* 左侧表单 */}
            <div className="col-span-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 基本信息 */}
                <div className="bg-space-mid/50 rounded-2xl p-4 border border-white/5">
                  <h3 className="text-xs font-medium text-ink-secondary uppercase tracking-wider mb-3">
                    基本信息
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-ink-secondary mb-2">
                        宠物名字 <span className="text-gold">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="例如：小白"
                        className="w-full px-3 py-2.5 rounded-xl bg-space-deepest/50 border border-white/10 text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-gold/50 focus:shadow-[0_0_16px_rgba(245,185,66,0.12)] transition-all"
                        maxLength={30}
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-ink-secondary mb-2">
                        品种
                      </label>
                      <input
                        type="text"
                        value={species}
                        onChange={(e) => setSpecies(e.target.value)}
                        placeholder="例如：金毛犬 / 英短猫"
                        className="w-full px-3 py-2.5 rounded-xl bg-space-deepest/50 border border-white/10 text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-gold/50 focus:shadow-[0_0_16px_rgba(245,185,66,0.12)] transition-all"
                        maxLength={30}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-ink-secondary mb-2">
                          出生日期
                        </label>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full px-2 py-2.5 text-sm rounded-xl bg-space-deepest/50 border border-white/10 text-ink-primary focus:outline-none focus:border-gold/50 focus:shadow-[0_0_16px_rgba(245,185,66,0.12)] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-ink-secondary mb-2">
                          彩虹桥日期
                        </label>
                        <input
                          type="date"
                          value={deathDate}
                          onChange={(e) => setDeathDate(e.target.value)}
                          className="w-full px-2 py-2.5 text-sm rounded-xl bg-space-deepest/50 border border-white/10 text-ink-primary focus:outline-none focus:border-gold/50 focus:shadow-[0_0_16px_rgba(245,185,66,0.12)] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 纪念寄语 */}
                <div className="bg-space-mid/50 rounded-2xl p-4 border border-white/5">
                  <h3 className="text-xs font-medium text-ink-secondary uppercase tracking-wider mb-3">
                    纪念寄语
                  </h3>
                  <textarea
                    value={epitaph}
                    onChange={(e) => setEpitaph(e.target.value)}
                    placeholder="一句话纪念 TA..."
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl bg-space-deepest/50 border border-white/10 text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-gold/50 focus:shadow-[0_0_16px_rgba(245,185,66,0.12)] transition-all resize-none"
                    maxLength={100}
                  />
                  <p className="text-xs text-ink-muted mt-1.5 text-right">
                    {epitaph.length}/100
                  </p>
                </div>

                {/* 错误提示 */}
                {error && (
                  <p className="text-sm text-rose-400 bg-rose-500/10 rounded-xl px-4 py-3 border border-rose-500/20">
                    {error}
                  </p>
                )}

                {/* 提交按钮 */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-capsule bg-white/5 border border-white/10 text-ink-secondary hover:bg-white/10 flex-1"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-capsule bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-space-deepest font-semibold glow-gold flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? "创建中..." : "点亮这颗星"}
                  </button>
                </div>
              </form>
            </div>

            {/* 右侧预览 */}
          <div className="col-span-4">
            <div className="bg-space-mid/50 rounded-2xl p-4 border border-white/5 h-full flex flex-col">
                <h3 className="text-xs font-medium text-ink-secondary uppercase tracking-wider mb-3">
                  星球外观
                </h3>

                {/* 星球预览 */}
                <div className="flex flex-col items-center mb-4">
                  <div className="relative w-20 h-20 mb-2">
                    {/* 光晕 */}
                    <div
                      className="absolute inset-0 rounded-full blur-xl opacity-40 transition-colors duration-300"
                      style={{ backgroundColor: color }}
                    />
                    {/* 星球主体 */}
                    <div
                      className="relative w-full h-full rounded-full shadow-lg transition-all duration-300"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${color}, ${color}99, ${color}66)`,
                        boxShadow: `0 0 30px ${color}40, inset 0 -10px 20px rgba(0,0,0,0.3)`,
                      }}
                    >
                      {/* 高光 */}
                      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
                    </div>
                    {/* 光环 */}
                    {hasRing && (
                      <div
                        className="absolute inset-0 rounded-full border-2 opacity-50"
                        style={{
                          borderColor: color,
                          transform: "rotateX(70deg)",
                        }}
                      />
                    )}
                  </div>
                  <p className="text-sm text-ink-primary font-medium">
                    {colorPresets.find((p) => p.value === color)?.name || "自定义"}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {textureOptions.find((t) => t.value === texture)?.name}
                  </p>
                </div>

                {/* 颜色选择 */}
                <div className="mb-4">
                  <label className="block text-xs text-ink-secondary mb-2">
                    颜色主题
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setColor(preset.value)}
                        className={`relative w-7 h-7 rounded-full transition-all duration-200 ${
                          color === preset.value
                            ? "ring-2 ring-offset-2 ring-offset-space-mid ring-gold scale-110"
                            : "hover:scale-110 hover:brightness-110"
                        }`}
                        style={{ backgroundColor: preset.value }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>

                {/* 纹理选择 */}
                <div className="mb-4">
                  <label className="block text-xs text-ink-secondary mb-2">
                    纹理风格
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {textureOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setTexture(opt.value)}
                        className={`px-2 py-1.5 rounded-lg text-xs transition-all duration-200 ${
                          texture === opt.value
                            ? "bg-gold/20 text-gold border border-gold/40"
                            : "bg-space-deepest/50 text-ink-secondary border border-white/10 hover:border-white/30 hover:text-ink-primary"
                        }`}
                      >
                        {opt.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 光环开关 */}
                <button
                  type="button"
                  onClick={() => setHasRing(!hasRing)}
                  className={`mt-auto w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                    hasRing
                      ? "bg-gold/20 text-gold border-gold/40"
                      : "bg-space-deepest/50 text-ink-secondary border border-white/10 hover:border-white/30"
                  }`}
                >
                  <span className="text-base">💫</span>
                  <span className="text-sm">添加光环</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

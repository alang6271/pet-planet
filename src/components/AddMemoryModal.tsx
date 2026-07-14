import { useState, useRef } from "react";
import { X, Loader2, ImagePlus, Trash2 } from "lucide-react";
import { createMemory, uploadMemoryImages } from "@/api/memories";
import type { Memory } from "../../shared/types";
import Modal from "./Modal";

interface AddMemoryModalProps {
  open: boolean;
  petId: string;
  onClose: () => void;
  onCreated: (memory: Memory) => void;
}

const categoryOptions: { label: string; value: Memory["category"] }[] = [
  { label: "幼年", value: "baby" },
  { label: "成年", value: "adult" },
  { label: "趣事", value: "funny" },
  { label: "日常", value: "daily" },
  { label: "告别", value: "farewell" },
];

/**
 * 添加记忆模态框
 * 照片上传 + 文字记录 + 日期 + 分类
 */
export default function AddMemoryModal({
  open,
  petId,
  onClose,
  onCreated,
}: AddMemoryModalProps) {
  const [content, setContent] = useState("");
  const [memoryDate, setMemoryDate] = useState("");
  const [category, setCategory] = useState<Memory["category"]>("daily");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 选择照片
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const valid = selected.filter((f) => f.type.startsWith("image/"));
    const limited = valid.slice(0, 9 - files.length);

    setFiles((prev) => [...prev, ...limited]);
    setPreviews((prev) => [
      ...prev,
      ...limited.map((f) => URL.createObjectURL(f)),
    ]);

    // 清空 input 以便重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 移除某张照片
  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) {
      setError("请写一些文字或上传照片");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      // 1. 先创建记忆记录
      const memory = await createMemory(petId, {
        content: content.trim(),
        memory_date: memoryDate || undefined,
        category,
      });

      // 2. 如果有照片，上传
      if (files.length > 0) {
        const imagePaths = await uploadMemoryImages(memory.id, files);
        onCreated({ ...memory, image_paths: imagePaths });
      } else {
        onCreated(memory);
      }

      // 重置
      setContent("");
      setMemoryDate("");
      setCategory("daily");
      previews.forEach((p) => URL.revokeObjectURL(p));
      setFiles([]);
      setPreviews([]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    previews.forEach((p) => URL.revokeObjectURL(p));
    setFiles([]);
    setPreviews([]);
    setContent("");
    setMemoryDate("");
    setCategory("daily");
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-space-dark p-8">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-ink-muted hover:text-ink-primary transition-colors"
          aria-label="关闭"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8">
          <div className="text-3xl mb-3">📷</div>
          <h2 className="font-serif text-2xl font-medium text-ink-primary mb-2">
            添加记忆
          </h2>
          <p className="text-sm text-ink-secondary">
            记录与 TA 的点点滴滴，打造专属的时光胶囊
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 照片上传 */}
          <div>
            <label className="block text-sm text-ink-secondary mb-2">
              照片 <span className="text-ink-muted text-xs">最多 9 张</span>
            </label>

            {/* 预览网格 */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {previews.map((preview, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-lg overflow-hidden bg-space-mid group"
                  >
                    <img
                      src={preview}
                      alt={`预览 ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-space-deepest/80 flex items-center justify-center text-ink-secondary hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 上传按钮 */}
            {files.length < 9 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 rounded-xl border border-dashed border-white/15 hover:border-gold/40 hover:bg-white/[0.02] transition-all flex flex-col items-center justify-center gap-2 text-ink-muted hover:text-gold"
              >
                <ImagePlus className="w-6 h-6" />
                <span className="text-xs">点击上传照片</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* 文字记录 */}
          <div>
            <label className="block text-sm text-ink-secondary mb-2">
              文字记录
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="那一刻，发生了什么..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-space-mid border border-white/10 text-ink-primary placeholder-ink-muted focus:outline-none focus:border-gold/50 transition-colors resize-none"
              maxLength={500}
            />
          </div>

          {/* 日期 + 分类 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink-secondary mb-2">
                日期
              </label>
              <input
                type="date"
                value={memoryDate}
                onChange={(e) => setMemoryDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-space-mid border border-white/10 text-ink-primary focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-ink-secondary mb-2">
                分类
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as Memory["category"])
                }
                className="w-full px-4 py-3 rounded-xl bg-space-mid border border-white/10 text-ink-primary focus:outline-none focus:border-gold/50 transition-colors"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <p className="text-sm text-rose-400 bg-rose-500/10 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          {/* 提交 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="btn-capsule border border-white/10 text-ink-secondary hover:bg-white/5 flex-1"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-capsule bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-space-deepest font-semibold glow-gold flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "保存中..." : "保存记忆"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

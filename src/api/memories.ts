import type { Memory, ApiResponse } from "../../shared/types";

const BASE = "/api";

/**
 * 获取某宠物的所有记忆档案
 */
export async function getMemories(petId: string): Promise<Memory[]> {
  const res = await fetch(`${BASE}/pets/${petId}/memories`);
  const json: ApiResponse<Memory[]> = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || "获取失败");
  }
  return json.data;
}

/**
 * 创建新记忆
 */
export async function createMemory(
  petId: string,
  data: {
    content: string;
    memory_date?: string;
    category?: Memory["category"];
  }
): Promise<Memory> {
  const res = await fetch(`${BASE}/pets/${petId}/memories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json: ApiResponse<Memory> = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || "创建失败");
  }
  return json.data;
}

/**
 * 上传记忆照片（多图）
 */
export async function uploadMemoryImages(
  memoryId: string,
  files: File[]
): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });
  const res = await fetch(`${BASE}/memories/${memoryId}/upload`, {
    method: "POST",
    body: formData,
  });
  const json: ApiResponse<{ image_paths: string[] }> = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || "上传失败");
  }
  return json.data.image_paths;
}

/**
 * 删除记忆
 */
export async function deleteMemory(id: string): Promise<void> {
  const res = await fetch(`${BASE}/memories/${id}`, { method: "DELETE" });
  const json: ApiResponse = await res.json();
  if (!json.success) {
    throw new Error(json.error || "删除失败");
  }
}

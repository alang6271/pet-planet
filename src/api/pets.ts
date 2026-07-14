import type { Pet, PlanetConfig, ApiResponse } from "../../shared/types";

const BASE = "/api";

/**
 * 创建新宠物星球
 */
export async function createPet(data: {
  name: string;
  species?: string;
  birth_date?: string;
  death_date?: string;
  epitaph?: string;
  planet_config?: PlanetConfig;
}): Promise<Pet> {
  const res = await fetch(`${BASE}/pets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json: ApiResponse<Pet> = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || "创建失败");
  }
  return json.data;
}

/**
 * 获取所有宠物星球列表
 */
export async function getPets(): Promise<Pet[]> {
  const res = await fetch(`${BASE}/pets`);
  const json: ApiResponse<Pet[]> = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || "获取失败");
  }
  return json.data;
}

/**
 * 获取单个宠物详情
 */
export async function getPet(id: string): Promise<Pet> {
  const res = await fetch(`${BASE}/pets/${id}`);
  const json: ApiResponse<Pet> = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || "获取失败");
  }
  return json.data;
}

/**
 * 删除宠物
 */
export async function deletePet(id: string): Promise<void> {
  const res = await fetch(`${BASE}/pets/${id}`, { method: "DELETE" });
  const json: ApiResponse = await res.json();
  if (!json.success) {
    throw new Error(json.error || "删除失败");
  }
}

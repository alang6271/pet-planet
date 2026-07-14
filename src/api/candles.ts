import type { Candle, ApiResponse } from "../../shared/types";

const BASE = "/api";

/**
 * 获取某宠物的所有蜡烛
 */
export async function getCandles(petId: string): Promise<Candle[]> {
  const res = await fetch(`${BASE}/pets/${petId}/candles`);
  const json: ApiResponse<Candle[]> = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || "获取失败");
  }
  return json.data;
}

/**
 * 点亮一支新蜡烛
 */
export async function lightCandle(
  petId: string,
  data: { lighter_name?: string; message?: string }
): Promise<Candle> {
  const res = await fetch(`${BASE}/pets/${petId}/candles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json: ApiResponse<Candle> = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || "点亮失败");
  }
  return json.data;
}

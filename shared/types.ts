// 宠物信息
export interface Pet {
  id: string;
  name: string;
  species: string;
  birth_date: string | null;
  death_date: string | null;
  avatar_base64: string | null;
  epitaph: string | null;
  planet_config: PlanetConfig;
  created_at: string;
  updated_at: string;
}

// 星球配置
export interface PlanetConfig {
  color: string;        // 星球颜色
  texture: 'smooth' | 'stripes' | 'spots' | 'nebula'; // 纹理风格
  hasRing: boolean;     // 是否有光环
  ringColor?: string;   // 光环颜色
  decoration?: 'stars' | 'petals' | 'sparkles' | 'none'; // 装饰元素
}

// 记忆档案
export interface Memory {
  id: string;
  pet_id: string;
  content: string;
  image_paths: string[];
  memory_date: string;
  category: 'baby' | 'adult' | 'funny' | 'daily' | 'farewell';
  created_at: string;
}

// 蜡烛
export interface Candle {
  id: string;
  pet_id: string;
  lighter_name: string | null;
  message: string | null;
  created_at: string;
}

// API 响应
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

import { useRef, useMemo } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Pet } from "../../shared/types";

interface PlanetMeshProps {
  pet: Pet;
  position: [number, number, number];
  hovered: boolean;
  onHover: (pet: Pet | null) => void;
  onClick: (pet: Pet) => void;
  hideLabel?: boolean;
}

/**
 * 生成程序化星球纹理（简洁水晶球风格：柔和径向渐变）
 */
function createPlanetTexture(
  baseColor: string,
  textureType: Pet["planet_config"]["texture"]
): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const color = new THREE.Color(baseColor);

  // 水晶球底色：从中心到边缘的径向渐变，中心明亮，边缘柔和
  const lighter = color.clone().lerp(new THREE.Color("#ffffff"), 0.35);
  const darker = color.clone().lerp(new THREE.Color("#000000"), 0.15);
  const baseGradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  baseGradient.addColorStop(0, `#${lighter.getHexString()}`);
  baseGradient.addColorStop(0.6, baseColor);
  baseGradient.addColorStop(1, `#${darker.getHexString()}`);
  ctx.fillStyle = baseGradient;
  ctx.fillRect(0, 0, size, size);

  // 根据纹理类型绘制不同图案
  if (textureType === "stripes") {
    // 柔和横向条纹
    for (let y = 0; y < size; y += 20) {
      const variation = Math.sin(y * 0.05) * 0.25 + 0.75;
      const r = Math.floor(color.r * 255 * variation);
      const g = Math.floor(color.g * 255 * variation);
      const b = Math.floor(color.b * 255 * variation);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
      ctx.fillRect(0, y, size, 10);
    }
  } else if (textureType === "spots") {
    // 柔光斑点
    for (let i = 0; i < 35; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = 25 + Math.random() * 45;
      const variation = 0.65 + Math.random() * 0.4;
      const r = Math.floor(color.r * 255 * variation);
      const g = Math.floor(color.g * 255 * variation);
      const b = Math.floor(color.b * 255 * variation);
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.35)`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (textureType === "nebula") {
    // 星云图案
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = 50 + Math.random() * 70;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      const variation = 0.5 + Math.random() * 0.6;
      const r = Math.floor(color.r * 255 * variation);
      const g = Math.floor(color.g * 255 * variation);
      const b = Math.floor(color.b * 255 * variation);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * 单个 3D 星球（水晶球风格）
 * 支持自转、悬停高亮、点击进入、常驻名字标签
 */
export default function PlanetMesh({
  pet,
  position,
  hovered,
  onHover,
  onClick,
  hideLabel = false,
}: PlanetMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const { color, texture, hasRing, ringColor } = pet.planet_config;

  // 生成星球表面纹理
  const planetTexture = useMemo(
    () => createPlanetTexture(color, texture),
    [color, texture]
  );

  // 星球大小根据是否悬停微调
  const scale = hovered ? 1.12 : 1;

  // 缓慢自转 + 漂浮
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.12;
    }
    if (groupRef.current) {
      // 上下漂浮
      groupRef.current.position.y =
        position[1] + Math.sin(Date.now() * 0.0004 + position[0]) * 0.25;
    }
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(pet);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(null);
    document.body.style.cursor = "default";
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick(pet);
  };

  return (
    <group ref={groupRef} position={position}>
      {/* 星球主体（水晶球材质） */}
      <mesh
        ref={meshRef}
        scale={scale}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial
          map={planetTexture}
          roughness={0.1}
          metalness={0.05}
          transparent
          opacity={0.92}
          transmission={0.6}
          thickness={0.5}
          clearcoat={1}
          clearcoatRoughness={0.05}
          emissive={color}
          emissiveIntensity={hovered ? 0.25 : 0.12}
        />
      </mesh>

      {/* 柔和光晕（悬停时增强） */}
      <mesh scale={scale * 1.2}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.22 : 0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 光环 */}
      {hasRing && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]} scale={scale}>
          <ringGeometry args={[1.4, 1.9, 64]} />
          <meshBasicMaterial
            color={ringColor || color}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 常驻名字标签（星球正上方） */}
      {!hideLabel && (
        <Html position={[0, 1.55, 0]} center distanceFactor={10}>
          <div
            className={`pointer-events-none select-none whitespace-nowrap rounded-full px-4 py-1.5 transition-all duration-200 ${
              hovered
                ? "bg-white/20 backdrop-blur-md border border-white/30 scale-110"
                : "bg-space-deepest/70 backdrop-blur-sm border border-white/10"
            }`}
          >
            <span className="font-serif text-lg text-ink-primary">
              {pet.name}
            </span>
          </div>
        </Html>
      )}

      {/* 悬停时显示寄语和日期（名字下方） */}
      {!hideLabel && hovered && (pet.epitaph || pet.death_date) && (
        <Html position={[0, 0.85, 0]} center distanceFactor={10}>
          <div className="pointer-events-none select-none whitespace-nowrap rounded-2xl border border-white/15 bg-space-deepest/85 backdrop-blur-md px-4 py-2.5 shadow-xl">
            {pet.epitaph && (
              <p className="text-xs text-ink-secondary max-w-[200px]">
                {pet.epitaph}
              </p>
            )}
            {pet.death_date && (
              <p className="text-[10px] text-ink-muted mt-1">
                {pet.death_date}
              </p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import type { PlanetConfig } from "../../shared/types";

/**
 * 生成程序化星球纹理（简洁水晶球风格：柔和径向渐变）
 */
function createPlanetTexture(
  baseColor: string,
  textureType: PlanetConfig["texture"]
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
 * 小型星球展示（用于宠物空间头部）
 */
function MiniPlanet({ config }: { config: PlanetConfig }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { color, texture, hasRing, ringColor } = config;

  const planetTexture = useMemo(
    () => createPlanetTexture(color, texture),
    [color, texture]
  );

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.18;
    }
  });

  return (
    <group>
      {/* 星球主体（水晶球材质） */}
      <mesh ref={meshRef}>
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
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* 柔和光晕 */}
      <mesh scale={1.2}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 光环 */}
      {hasRing && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[1.4, 1.9, 64]} />
          <meshBasicMaterial
            color={ringColor || color}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

interface MiniPlanetViewProps {
  config: PlanetConfig;
}

/**
 * 小型星球展示视图（封装 Canvas）
 */
export default function MiniPlanetView({ config }: MiniPlanetViewProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, -5, -5]} intensity={0.4} color="#ffffff" />
        <MiniPlanet config={config} />
      </Canvas>
    </div>
  );
}
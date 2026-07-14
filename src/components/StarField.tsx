import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

/**
 * 用 Canvas 生成圆形星光纹理
 * 径向渐变：中心亮，边缘透明，形成柔和的光晕
 */
function createStarTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.9)");
  gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.4)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * 星星粒子系统
 * 在深空背景中生成大量缓慢漂浮、闪烁的星辰
 */
function Stars() {
  const ref = useRef<THREE.Points>(null);
  const count = 4000;

  // 生成圆形星光纹理
  const starTexture = useMemo(() => createStarTexture(), []);

  // 生成星星位置（球形分布）
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // 球形分布，半径在 20-80 之间
      const r = 20 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // 星星颜色：大部分白色，少量金色和淡蓝色
      const colorType = Math.random();
      if (colorType < 0.7) {
        // 白色星
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
      } else if (colorType < 0.85) {
        // 暖金色星
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.85;
        colors[i * 3 + 2] = 0.5;
      } else {
        // 淡蓝色星
        colors[i * 3] = 0.6;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 1;
      }
    }

    return { positions, colors };
  }, []);

  // 缓慢旋转
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.015;
      ref.current.rotation.x += delta * 0.005;
    }
  });

  // 使用 geometry 对象方式创建
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.4}
        map={starTexture}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * 漂浮的光点装饰（暖色调，模拟星云光芒）
 */
function GlowParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 30;

  const starTexture = useMemo(() => createStarTexture(), []);

  const { positions } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 20;
    }
    return { positions };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * 0.02;
    }
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={3}
        map={starTexture}
        color="#f5b942"
        transparent
        opacity={0.2}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * 3D 星空背景
 * 固定在页面背景，营造深空氛围
 */
export default function StarField() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 0], fov: 75, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Stars />
        <GlowParticles />
      </Canvas>
    </div>
  );
}

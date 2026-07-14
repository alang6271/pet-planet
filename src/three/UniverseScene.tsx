import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState, useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import PlanetMesh from "./PlanetMesh";
import type { Pet } from "../../shared/types";

interface UniverseSceneProps {
  pets: Pet[];
  onPlanetClick: (pet: Pet) => void;
  hideLabels?: boolean;
  targetPet?: Pet | null;
}

/**
 * 相机平滑移动控制器
 */
function CameraController({
  targetPosition,
  onComplete,
}: {
  targetPosition: THREE.Vector3 | null;
  onComplete?: () => void;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const targetRef = useRef<THREE.Vector3 | null>(null);
  const startPositionRef = useRef<THREE.Vector3 | null>(null);
  const startTimeRef = useRef<number>(0);
  const animatingRef = useRef(false);

  useEffect(() => {
    if (targetPosition) {
      targetRef.current = targetPosition.clone();
      startPositionRef.current = camera.position.clone();
      startTimeRef.current = Date.now();
      animatingRef.current = true;

      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
    }
  }, [targetPosition, camera.position]);

  useEffect(() => {
    if (!animatingRef.current || !targetRef.current || !startPositionRef.current) return;

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const duration = 800;
      const progress = Math.min(elapsed / duration, 1);

      const easeProgress = 1 - Math.pow(1 - progress, 3);

      camera.position.lerpVectors(
        startPositionRef.current!,
        targetRef.current!,
        easeProgress
      );

      const lookAtPos = new THREE.Vector3(0, 0, 0);
      camera.lookAt(lookAtPos);

      if (progress >= 1) {
        animatingRef.current = false;
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
        }
        if (onComplete) {
          onComplete();
        }
      } else {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={8}
      maxDistance={40}
      autoRotate
      autoRotateSpeed={0.3}
      enableDamping
      dampingFactor={0.05}
    />
  );
}

/**
 * 简易星空背景（场景内）
 */
function SceneStars() {
  const positions = useMemo(() => {
    const count = 2000;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 40 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <points geometry={geometry}>
      <pointsMaterial
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/**
 * 3D 宇宙场景
 * 多颗星球在深空背景中漂浮，可拖拽旋转视角、滚轮缩放
 */
export default function UniverseScene({
  pets,
  onPlanetClick,
  hideLabels = false,
  targetPet = null,
}: UniverseSceneProps) {
  const [hoveredPet, setHoveredPet] = useState<Pet | null>(null);

  // 将星球均匀分布在球面空间中
  const positions = useMemo(() => {
    return pets.map((_, index) => {
      // 螺旋分布，避免重叠
      const angle = index * 2.4; // 黄金角
      const radius = 6 + index * 1.8;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(index * 0.8) * 3;
      return [x, y, z] as [number, number, number];
    });
  }, [pets]);

  // 计算目标相机位置（聚焦到目标星球的对面）
  const targetCameraPosition = useMemo(() => {
    if (!targetPet) return null;
    const targetIndex = pets.findIndex((p) => p.id === targetPet.id);
    if (targetIndex === -1) return null;
    const pos = positions[targetIndex];
    const direction = new THREE.Vector3(pos[0], pos[1], pos[2]).normalize();
    return direction.multiplyScalar(12).add(new THREE.Vector3(0, 2, 0));
  }, [targetPet, pets, positions]);

  return (
    <Canvas
      camera={{ position: [0, 5, 20], fov: 60, near: 0.1, far: 200 }}
      gl={{ antialias: true }}
    >
      {/* 灯光 */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#f5b942" />

      {/* 星空背景 */}
      <SceneStars />

      {/* 星球群 */}
      {pets.map((pet, index) => (
        <PlanetMesh
          key={pet.id}
          pet={pet}
          position={positions[index]}
          hovered={hoveredPet?.id === pet.id}
          onHover={setHoveredPet}
          onClick={onPlanetClick}
          hideLabel={hideLabels}
        />
      ))}

      {/* 相机轨道控制（含平滑移动） */}
      <CameraController targetPosition={targetCameraPosition} />
    </Canvas>
  );
}

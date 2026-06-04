"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Grid } from "@react-three/drei";
import * as THREE from "three";

export interface RackItem {
  id: string;
  model: string;
  brand: "NovaStar" | "Pixelhue" | "Other";
  ru: number; // Rack Units (1U = 0.044m approx in our scale)
  positionIndex: number; // Position from bottom (1 to 42)
  status: "ONLINE" | "ERROR" | "WARN";
  ports: number;
}

interface Rack3DVisualizerProps {
  items: RackItem[];
  onSelectItem: (id: string) => void;
  selectedItemId: string | null;
  showCables: boolean;
}

const RU_HEIGHT = 0.044; // Altura de 1 unidad de rack en la escena

function EquipmentUnit({
  item,
  isSelected,
  onSelect,
}: {
  item: RackItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  // Colores según marca y estado
  const bodyColor = item.brand === "NovaStar" ? "#dc2626" : item.brand === "Pixelhue" ? "#2563eb" : "#52525b";
  const statusColor = item.status === "ONLINE" ? "#10b981" : item.status === "ERROR" ? "#ef4444" : "#f59e0b";

  // Posicionamiento en Y (asumiendo que el rack tiene 42U y su centro está en Y=0)
  // 42U * 0.044 = 1.848m total height. Bottom is at -0.924
  const yPos = -0.924 + (item.positionIndex * RU_HEIGHT) + (item.ru * RU_HEIGHT) / 2;

  useFrame(() => {
    if (meshRef.current) {
      if (isSelected || hovered) {
        (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5;
      } else {
        (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
      }
    }
  });

  // Generar array de puertos (mock visual trasero)
  const portPositions = [];
  const portsPerRow = 8;
  for (let i = 0; i < item.ports; i++) {
    const row = Math.floor(i / portsPerRow);
    const col = i % portsPerRow;
    portPositions.push({ x: -0.4 + col * 0.1, y: 0.01 - row * 0.02, z: -0.35 });
  }

  return (
    <group 
      position={[0, yPos, 0]} 
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Cuerpo principal */}
      <mesh ref={meshRef}>
        <boxGeometry args={[1.05, item.ru * RU_HEIGHT - 0.002, 0.7]} />
        <meshStandardMaterial 
          color={bodyColor}
          emissive={bodyColor}
          emissiveIntensity={0}
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* Etiqueta del modelo */}
      <Text
        position={[-0.45, 0, 0.351]}
        fontSize={0.03}
        color="white"
        anchorX="left"
        anchorY="middle"
      >
        {item.model}
      </Text>

      {/* Indicador LED estado */}
      <mesh position={[0.45, 0, 0.351]}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshBasicMaterial color={statusColor} />
      </mesh>

      {/* Puertos traseros */}
      {portPositions.map((pos, idx) => (
        <mesh key={idx} position={[pos.x, pos.y, pos.z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.05, 16]} />
          <meshStandardMaterial color="#27272a" />
        </mesh>
      ))}
    </group>
  );
}

function RackChassis() {
  return (
    <group position={[0, 0, 0]}>
      {/* Estructura alámbrica del chasis */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 2.2, 0.8]} />
        <meshBasicMaterial color="#3f3f46" wireframe opacity={0.3} transparent />
      </mesh>
      
      {/* Panel frontal de cristal/oscurecido */}
      <mesh position={[0, 0, 0.4]}>
        <boxGeometry args={[1.19, 2.19, 0.02]} />
        <meshPhysicalMaterial 
          color="#27272a" 
          transparent 
          opacity={0.1} 
          roughness={0.1} 
          transmission={0.9} 
          thickness={0.02} 
        />
      </mesh>

      {/* Raíles laterales */}
      <mesh position={[-0.55, 0, 0.35]}>
        <cylinderGeometry args={[0.02, 0.02, 2.2, 16]} />
        <meshStandardMaterial color="#52525b" metalness={0.8} />
      </mesh>
      <mesh position={[0.55, 0, 0.35]}>
        <cylinderGeometry args={[0.02, 0.02, 2.2, 16]} />
        <meshStandardMaterial color="#52525b" metalness={0.8} />
      </mesh>
    </group>
  );
}

export function Rack3DVisualizer({ items, onSelectItem, selectedItemId, showCables }: Rack3DVisualizerProps) {
  return (
    <div className="w-full h-full min-h-[500px] bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 relative">
      <Canvas camera={{ position: [2, 1.5, 3], fov: 45 }} gl={{ preserveDrawingBuffer: true }} id="rack-canvas">
        {/* Iluminación requerida */}
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 10, 5]} intensity={1.2} />
        <directionalLight position={[-3, 5, -3]} intensity={0.6} />

        {/* Grid helper */}
        <Grid 
          position={[0, -1.1, 0]} 
          args={[10, 10]} 
          cellSize={1} 
          cellThickness={1} 
          cellColor="#18181b" 
          sectionSize={1} 
          sectionThickness={1.5} 
          sectionColor="#27272a" 
          fadeDistance={30} 
        />

        {/* Controles de órbita */}
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          maxPolarAngle={Math.PI / 2} 
          minDistance={1}
          maxDistance={5}
        />

        {/* Chasis */}
        <RackChassis />

        {/* Equipamiento */}
        {items.map((item) => (
          <EquipmentUnit 
            key={item.id} 
            item={item} 
            isSelected={selectedItemId === item.id}
            onSelect={() => onSelectItem(item.id)}
          />
        ))}
        
        {/* Futuro: Render de cables si showCables = true */}
      </Canvas>
    </div>
  );
}

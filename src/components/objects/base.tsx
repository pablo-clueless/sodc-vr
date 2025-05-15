import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import React from "react";

import { useControlStore } from "@/store/z-stores";

interface Props {
  geometry: React.JSX.Element;
  id: string;
  material: React.JSX.Element;
  color?: string;
  position?: [number, number, number];
}

export const Base = ({
  geometry,
  id,
  material,
  color = "blue",
  position = [0, 0.5, 0],
}: Props) => {
  const materialRef = React.useRef<THREE.Material>(null);
  const ref = React.useRef<RapierRigidBody>(null);
  const speed = 0.0001;

  const { selected, keysPressed, onSelect } = useControlStore();

  useFrame(() => {
    if (!ref.current) return;

    if (selected === id && keysPressed.size > 0) {
      const x = position[0];
      const y = position[1];
      const z = position[2];

      if (keysPressed.has("w")) {
        ref.current.applyImpulse({ x, y, z: z - speed }, true);
      }
      if (keysPressed.has("s")) {
        ref.current.applyImpulse({ x, y, z: z + speed }, true);
      }
      if (keysPressed.has("a")) {
        ref.current.applyImpulse({ x: x - speed, y, z }, true);
      }
      if (keysPressed.has("d")) {
        ref.current.applyImpulse({ x: x + speed, y, z }, true);
      }
      if (keysPressed.has("q")) {
        ref.current.applyImpulse({ x, y: y + speed, z }, true);
      }
      if (keysPressed.has("e")) {
        ref.current.applyImpulse({ x, y: y - speed, z }, true);
      }
    }
  });

  useFrame(() => {
    if (materialRef.current) {
      if (selected === id) {
        (materialRef.current as THREE.MeshStandardMaterial).color.set("gray");
      } else {
        (materialRef.current as THREE.MeshStandardMaterial).color.set(color);
      }
    }
  });

  return (
    <RigidBody ref={ref}>
      <mesh position={position} onClick={() => onSelect(id)}>
        {geometry}
        {React.cloneElement(material, { ref: materialRef })}
      </mesh>
    </RigidBody>
  );
};

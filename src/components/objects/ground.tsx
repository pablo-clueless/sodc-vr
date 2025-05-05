import React, { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";

import { useControlStore } from "@/store/z-stores/control";

export const Ground: React.FC = () => {
  const ref = useRef<THREE.Mesh>(null);
  const { setSelectedObject } = useControlStore();

  useEffect(() => {
    if (ref.current) {
      ref.current.receiveShadow = true;
    }
  }, []);

  const handleGroundClick = useCallback(() => {
    setSelectedObject(null);
  }, [setSelectedObject]);

  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      onClick={handleGroundClick}
    >
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  );
};

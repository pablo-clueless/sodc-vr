import * as THREE from "three";
import React from "react";

import { ControllableObject } from "./controllable";

type Position = [number, number, number];

export const Sphere = ({
  id,
  initialPosition,
  raycaster,
}: {
  id: string;
  initialPosition: Position;
  raycaster: React.RefObject<THREE.Raycaster>;
}) => {
  return (
    <ControllableObject
      id={id}
      initialPosition={initialPosition}
      raycaster={raycaster}
      objectType="sphere"
      objectSize={0.5}
      geometry={<sphereGeometry args={[0.5, 20, 20]} />}
      material={<meshStandardMaterial color="orange" />}
    />
  );
};

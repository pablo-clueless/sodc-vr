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
      geometry={<sphereGeometry args={[0.25, 16, 16]} />}
      material={<meshStandardMaterial color="red" />}
    />
  );
};

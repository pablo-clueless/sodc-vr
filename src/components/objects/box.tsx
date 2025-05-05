import * as THREE from "three";
import React from "react";

import { ControllableObject } from "./controllable";

type Position = [number, number, number];
type Rotation = [number, number, number];

export const Box = ({
  id,
  initialPosition,
  initialRotation,
  raycaster,
}: {
  id: string;
  initialPosition: Position;
  initialRotation: Rotation;
  raycaster: React.RefObject<THREE.Raycaster>;
}) => {
  return (
    <ControllableObject
      id={id}
      initialPosition={initialPosition}
      initialRotation={initialRotation}
      raycaster={raycaster}
      objectType="sphere"
      objectSize={0.25}
      geometry={<sphereGeometry args={[0.25, 16, 16]} />}
      material={<meshStandardMaterial color="red" />}
    />
  );
};

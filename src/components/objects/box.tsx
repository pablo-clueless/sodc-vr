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
      geometry={<boxGeometry args={[1, 1, 1]} />}
      material={<meshStandardMaterial color="orange" />}
    />
  );
};

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
      objectType="box"
      objectSize={0.25}
      geometry={<boxGeometry args={[0.25, 0.25, 0.25]} />}
      material={<meshStandardMaterial color="red" />}
    />
  );
};

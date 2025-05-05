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
      objectType="box"
      objectSize={0.5}
      geometry={<boxGeometry args={[1, 1, 1]} />}
      material={<meshStandardMaterial color="orange" />}
    />
  );
};

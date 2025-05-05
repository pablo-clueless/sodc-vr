import * as THREE from "three";

import { ControllableObject } from "./controllable";

type Position = [number, number, number];

export const Obstacle = ({
  id,
  position,
  raycaster,
}: {
  id: string;
  position: Position;
  raycaster: React.RefObject<THREE.Raycaster>;
}) => {
  return (
    <ControllableObject
      id={id}
      initialPosition={position}
      raycaster={raycaster}
      geometry={<boxGeometry args={[0.5, 0.5, 0.5]} />}
      material={
        <meshStandardMaterial
          color={`hsl(${parseInt(id.split("-")[1]) * 70}, 100%, 50%)`}
        />
      }
    />
  );
};

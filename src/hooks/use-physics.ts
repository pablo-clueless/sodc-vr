import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

import { useControlStore } from "@/store/z-stores/control";
import type { Position, Velocity } from "@/types";
import { handleCollision } from "@/lib/three";

export const usePhysics = (
  id: string,
  objectSize: number,
  objectType: "sphere" | "box" | "obstacle",
) => {
  const { objects, physics, updateObjectPosition, updateObjectVelocity } =
    useControlStore();

  const lastUpdateTimeRef = useRef(Date.now());
  const velocityRef = useRef<Velocity>([0, 0, 0]);
  const positionRef = useRef<Position>([0, 0, 0]);
  const onGroundRef = useRef(false);

  useFrame(() => {
    const now = Date.now();
    const dt = Math.min((now - lastUpdateTimeRef.current) / 1000, 0.1);
    lastUpdateTimeRef.current = now;

    const object = objects[id];
    if (!object || !object.isGravityAffected) return;

    const position = object.position;
    const velocity = object.velocity || [0, 0, 0];

    positionRef.current = position;
    velocityRef.current = velocity;

    const isOnGround = position[1] <= object.size + 0.01;
    const isVelocityNegligible =
      Math.abs(velocity[0]) < 0.01 &&
      Math.abs(velocity[1]) < 0.01 &&
      Math.abs(velocity[2]) < 0.01;

    if (isOnGround && isVelocityNegligible) {
      if (!onGroundRef.current) {
        updateObjectVelocity(id, [0, 0, 0]);
        onGroundRef.current = true;
      }
      return;
    }

    onGroundRef.current = isOnGround;

    let newVelocity: Velocity = [
      velocity[0],
      velocity[1] - physics.gravity * dt,
      velocity[2],
    ];

    let newPosition: Position = [
      position[0] + newVelocity[0] * dt,
      position[1] + newVelocity[1] * dt,
      position[2] + newVelocity[2] * dt,
    ];

    const collisionResult = handleCollision(
      objects,
      id,
      newPosition,
      newVelocity,
      physics,
    );
    newPosition = collisionResult.position;
    newVelocity = collisionResult.velocity;

    if (Math.abs(newPosition[1] - object.size) < 0.01) {
      const friction = Math.pow(1 - physics.friction, dt);
      newVelocity[0] *= friction;
      newVelocity[2] *= friction;
    }

    updateObjectPosition(id, newPosition);
    updateObjectVelocity(id, newVelocity);
  });

  return {
    getPosition: () => positionRef.current,
    getVelocity: () => velocityRef.current,
    setVelocity: (v: Velocity) => {
      velocityRef.current = v;
      updateObjectVelocity(id, v);
    },
  };
};

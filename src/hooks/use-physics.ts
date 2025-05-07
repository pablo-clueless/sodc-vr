import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

import { useControlStore } from "@/store/z-stores/control";
import type { Position, Velocity } from "@/types";
import { handleCollision } from "@/lib/three";
import { Clock } from "three";

export const usePhysics = (
  id: string,
  objectSize: number,
  objectType: "sphere" | "box" | "obstacle",
) => {
  const { objects, physics, updateObjectPosition, updateObjectVelocity } =
    useControlStore();

  const velocityRef = useRef<Velocity>([0, 0, 0]);
  const positionRef = useRef<Position>([0, 0, 0]);
  const onGroundRef = useRef(false);
  const isDraggingRef = useRef(false);

  useFrame(() => {
    const clock = new Clock();
    const dt = Math.min(clock.getDelta(), 0.016);

    const object = objects[id];
    if (!object || !object.isGravityAffected || isDraggingRef.current) return;

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

    if (newPosition[1] < object.size) {
      newPosition[1] = object.size;

      if (newVelocity[1] < 0) {
        newVelocity[1] = -newVelocity[1] * physics.restitution;
        newVelocity[0] *= 1 - physics.friction;
        newVelocity[2] *= 1 - physics.friction;
      }
    }

    for (const otherId in objects) {
      if (otherId === id) continue;

      const otherObject = objects[otherId];
      const dx = newPosition[0] - otherObject.position[0];
      const dy = newPosition[1] - otherObject.position[1];
      const dz = newPosition[2] - otherObject.position[2];

      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const minDistance = object.size + otherObject.size;

      if (distance < minDistance) {
        const nx = dx / distance;
        const ny = dy / distance;
        const nz = dz / distance;

        const penetration = minDistance - distance;

        newPosition[0] += nx * penetration * 0.5;
        newPosition[1] += ny * penetration * 0.5;
        newPosition[2] += nz * penetration * 0.5;

        const dotProduct =
          newVelocity[0] * nx + newVelocity[1] * ny + newVelocity[2] * nz;

        if (dotProduct < 0) {
          newVelocity[0] -= 2 * dotProduct * nx * physics.restitution;
          newVelocity[1] -= 2 * dotProduct * ny * physics.restitution;
          newVelocity[2] -= 2 * dotProduct * nz * physics.restitution;
        }
      }
    }

    const dampingFactor = 0.999;
    newVelocity[0] *= dampingFactor;
    newVelocity[1] *= dampingFactor;
    newVelocity[2] *= dampingFactor;

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
    setDragging: (isDragging: boolean) => {
      isDraggingRef.current = isDragging;
    },
  };
};

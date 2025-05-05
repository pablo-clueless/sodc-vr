import type { ObjectData, Physics, Position, Velocity } from "@/types";

const COLLISION_BUFFER = 0.05;

export const checkCollision = (
  objects: Record<string, ObjectData>,
  id: string,
  newPosition: Position,
): {
  collides: boolean;
  penetration?: number;
  normal?: Position;
  collidingId?: string;
} => {
  const currentObject = objects[id];
  if (!currentObject) return { collides: false };

  for (const otherId in objects) {
    if (otherId === id) continue;

    const otherObject = objects[otherId];
    const dx = newPosition[0] - otherObject.position[0];
    const dy = newPosition[1] - otherObject.position[1];
    const dz = newPosition[2] - otherObject.position[2];

    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const minDistance = currentObject.size + otherObject.size + COLLISION_BUFFER;

    if (distance < minDistance) {
      const penetration = minDistance - distance;
      const normal: Position =
        distance > 0 ? [dx / distance, dy / distance, dz / distance] : [1, 0, 0];

      return {
        collides: true,
        penetration,
        normal,
        collidingId: otherId,
      };
    }
  }

  return { collides: false };
};

export const checkPathCollision = (
  objects: Record<string, ObjectData>,
  id: string,
  startPos: Position,
  endPos: Position,
  steps = 10,
): { collides: boolean; safePosition: Position; collisionInfo?: any } => {
  const endCollision = checkCollision(objects, id, endPos);
  if (!endCollision.collides) {
    return { collides: false, safePosition: endPos };
  }

  for (let i = 1; i <= steps; i++) {
    const ratio = i / steps;
    const testPos: Position = [
      startPos[0] + (endPos[0] - startPos[0]) * ratio,
      startPos[1] + (endPos[1] - startPos[1]) * ratio,
      startPos[2] + (endPos[2] - startPos[2]) * ratio,
    ];

    const collisionResult = checkCollision(objects, id, testPos);
    if (collisionResult.collides) {
      const safeRatio = (i - 1) / steps;
      const safePosition: Position = [
        startPos[0] + (endPos[0] - startPos[0]) * safeRatio,
        startPos[1] + (endPos[1] - startPos[1]) * safeRatio,
        startPos[2] + (endPos[2] - startPos[2]) * safeRatio,
      ];

      return {
        collides: true,
        safePosition: i > 1 ? safePosition : startPos,
        collisionInfo: collisionResult,
      };
    }
  }

  return { collides: true, safePosition: startPos };
};

export const calculateSlideVector = (
  moveVector: Position,
  normal: Position,
): Position => {
  const dotProduct =
    moveVector[0] * normal[0] + moveVector[1] * normal[1] + moveVector[2] * normal[2];

  // Calculate slide vector: v - (n · v)n
  return [
    moveVector[0] - normal[0] * dotProduct,
    moveVector[1] - normal[1] * dotProduct,
    moveVector[2] - normal[2] * dotProduct,
  ];
};

export const handleCollision = (
  objects: Record<string, ObjectData>,
  id: string,
  position: Position,
  velocity: Velocity,
  physics: Physics,
): { position: Position; velocity: Velocity } => {
  const object = objects[id];
  if (!object) return { position, velocity };
  const minY = object.size;
  if (position[1] < minY) {
    return {
      position: [position[0], minY, position[2]],
      velocity: [
        velocity[0] * (1 - physics.friction),
        -velocity[1] * physics.restitution,
        velocity[2] * (1 - physics.friction),
      ],
    };
  }

  for (const otherId in objects) {
    if (otherId === id) continue;

    const otherObject = objects[otherId];
    const dx = position[0] - otherObject.position[0];
    const dy = position[1] - otherObject.position[1];
    const dz = position[2] - otherObject.position[2];

    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const minDistance = object.size + otherObject.size;

    if (distance < minDistance) {
      const nx = dx / distance;
      const ny = dy / distance;
      const nz = dz / distance;

      const penetration = minDistance - distance;

      const newPosition: Position = [
        position[0] + nx * penetration * 0.5,
        position[1] + ny * penetration * 0.5,
        position[2] + nz * penetration * 0.5,
      ];

      const vx = velocity[0];
      const vy = velocity[1];
      const vz = velocity[2];
      const impactVelocity = vx * nx + vy * ny + vz * nz;

      if (impactVelocity < 0) {
        const reflectedVx = vx - 2 * impactVelocity * nx;
        const reflectedVy = vy - 2 * impactVelocity * ny;
        const reflectedVz = vz - 2 * impactVelocity * nz;

        const newVelocity: Velocity = [
          reflectedVx * physics.restitution,
          reflectedVy * physics.restitution,
          reflectedVz * physics.restitution,
        ];

        return { position: newPosition, velocity: newVelocity };
      }

      return { position: newPosition, velocity };
    }
  }

  return { position, velocity };
};

export const moveWithCollisionAvoidance = (
  objects: Record<string, ObjectData>,
  id: string,
  currentPos: Position,
  desiredPos: Position,
): Position => {
  const moveVector: Position = [
    desiredPos[0] - currentPos[0],
    desiredPos[1] - currentPos[1],
    desiredPos[2] - currentPos[2],
  ];

  const pathCollision = checkPathCollision(objects, id, currentPos, desiredPos);

  if (!pathCollision.collides) {
    return desiredPos;
  }

  if (pathCollision.collisionInfo?.normal) {
    const slideVector = calculateSlideVector(
      moveVector,
      pathCollision.collisionInfo.normal,
    );

    const slidePos: Position = [
      pathCollision.safePosition[0] + slideVector[0] * 0.8,
      pathCollision.safePosition[1] + slideVector[1] * 0.8,
      pathCollision.safePosition[2] + slideVector[2] * 0.8,
    ];

    const slideCollision = checkCollision(objects, id, slidePos);
    if (!slideCollision.collides) {
      return slidePos;
    }
  }

  return pathCollision.safePosition;
};

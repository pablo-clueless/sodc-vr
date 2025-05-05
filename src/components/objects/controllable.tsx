import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { useControlStore } from "@/store/z-stores/control";
import { moveWithCollisionAvoidance } from "@/lib/three";
import { useDraggable, usePhysics } from "@/hooks";
import type { Position, Rotation } from "@/types";

interface ControllableObjectProps {
  id: string;
  initialPosition: Position;
  initialRotation?: Rotation;
  geometry: React.JSX.Element;
  material: React.JSX.Element;
  raycaster: React.RefObject<THREE.Raycaster>;
  objectType: "sphere" | "box" | "obstacle";
  objectSize: number;
}

export const ControllableObject: React.FC<ControllableObjectProps> = ({
  id,
  initialPosition,
  initialRotation = [0, 0, 0],
  geometry,
  material,
  raycaster,
  objectType,
  objectSize,
}) => {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [rotation, setRotation] = useState<Rotation>(initialRotation);
  const ref = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.Material>(null);
  const { camera } = useThree();
  const speed = 0.01;
  const rotationSpeed = 0.01;

  const {
    selectedObjectId,
    keysPressed,
    setSelectedObject,
    objects,
    registerObject,
    unregisterObject,
    updateObjectPosition,
    updateObjectVelocity,
  } = useControlStore();

  const physics = usePhysics(id, objectSize, objectType);

  const isSelected = selectedObjectId === id;

  useEffect(() => {
    registerObject({
      id,
      position: initialPosition,
      size: objectSize,
      type: objectType,
      velocity: [0, 0, 0],
      mass: objectType === "sphere" ? 0.8 : 1.2,
      isGravityAffected: true,
    });

    const objectId = id;
    return () => unregisterObject(objectId);
  }, []);

  const positionRef = useRef(position);

  useEffect(() => {
    positionRef.current = position;
    updateObjectPosition(id, position);
  }, [id, position]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedObject(id);
    },
    [id, setSelectedObject],
  );

  const handleDrag = useCallback(
    ({ x, y }: { x: number; y: number }) => {
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3(1, 0, 0);
      right.applyQuaternion(camera.quaternion);
      right.y = 0;
      right.normalize();

      const movementScale = 0.01;

      const movementX = x * movementScale;
      const movementZ = -y * movementScale;

      updateObjectVelocity(id, [0, 0, 0]);

      setPosition((prev) => {
        let newX = prev[0] + right.x * movementX + forward.x * movementZ;
        let newY = prev[1];
        let newZ = prev[2] + right.z * movementX + forward.z * movementZ;

        const minY = objectType === "sphere" ? 0.25 : 0.5;
        const desiredPos: Position = [newX, Math.max(minY, newY), newZ];

        return moveWithCollisionAvoidance(objects, id, prev, desiredPos);
      });
    },
    [camera, id, objects, objectType],
  );

  const { isDragging, dragHandlers } = useDraggable(handleDrag);

  useFrame(() => {
    if (!ref.current) return;

    if (materialRef.current) {
      if (isDragging) {
        (materialRef.current as THREE.MeshStandardMaterial).color.set("blue");
      } else if (isSelected) {
        (materialRef.current as THREE.MeshStandardMaterial).color.set("green");
      } else {
        const defaultColor =
          objectType === "sphere"
            ? "red"
            : objectType === "box"
              ? "orange"
              : `hsl(${parseInt(id.split("-")[1]) * 70}, 100%, 50%)`;
        (materialRef.current as THREE.MeshStandardMaterial).color.set(defaultColor);
      }
    }

    if (isSelected && keysPressed.size > 0) {
      updateObjectVelocity(id, [0, 0, 0]);

      setPosition((prev) => {
        let newX = prev[0];
        let newY = prev[1];
        let newZ = prev[2];

        if (keysPressed.has("w")) newZ -= speed;
        if (keysPressed.has("s")) newZ += speed;
        if (keysPressed.has("a")) newX -= speed;
        if (keysPressed.has("d")) newX += speed;
        if (keysPressed.has("q")) newY += speed;
        if (keysPressed.has("e")) newY -= speed;

        if (keysPressed.has(" ")) {
          physics.setVelocity([0, 5, 0]);
        }

        const minY = objectType === "sphere" ? 0.25 : 0.5;
        const desiredPos: Position = [newX, Math.max(minY, newY), newZ];

        return moveWithCollisionAvoidance(objects, id, prev, desiredPos);
      });

      setRotation((prev) => {
        let [rotX, rotY, rotZ] = prev;

        if (keysPressed.has("arrowup")) rotX -= rotationSpeed;
        if (keysPressed.has("arrowdown")) rotX += rotationSpeed;
        if (keysPressed.has("arrowleft")) rotY -= rotationSpeed;
        if (keysPressed.has("arrowright")) rotY += rotationSpeed;
        if (keysPressed.has("z")) rotZ -= rotationSpeed;
        if (keysPressed.has("x")) rotZ += rotationSpeed;

        return [rotX, rotY, rotZ];
      });
    }

    ref.current.position.set(...position);
    ref.current.rotation.set(...rotation);
  });

  return (
    <mesh
      ref={ref}
      position={position}
      rotation={rotation}
      {...dragHandlers}
      onClick={handleClick}
    >
      {geometry}
      {React.cloneElement(material, { ref: materialRef })}
    </mesh>
  );
};

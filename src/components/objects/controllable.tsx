import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import React from "react";

import { useControlStore } from "@/store/z-stores/control";
import { useDraggable } from "@/hooks";

type Position = [number, number, number];
type Rotation = [number, number, number];

export const ControllableObject = ({
  id,
  initialPosition,
  initialRotation = [0, 0, 0] as Rotation,
  geometry,
  material,
}: {
  id: string;
  initialPosition: Position;
  initialRotation?: Rotation;
  geometry: React.JSX.Element;
  material: React.JSX.Element;
  raycaster: React.RefObject<THREE.Raycaster>;
}) => {
  const [position, setPosition] = React.useState<Position>(initialPosition);
  const [rotation, setRotation] = React.useState<Rotation>(initialRotation);
  const ref = React.useRef<THREE.Mesh>(null);
  const materialRef = React.useRef<THREE.Material>(null);
  const { camera } = useThree();
  const speed = 0.01;
  const rotationSpeed = 0.01;

  const { selectedObjectId, keysPressed, setSelectedObject } = useControlStore();
  const isSelected = selectedObjectId === id;

  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedObject(id);
    },
    [id, setSelectedObject],
  );

  const handleDrag = React.useCallback(
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

      setPosition((prev) => {
        const newX = prev[0] + right.x * movementX + forward.x * movementZ;
        const newY = prev[1];
        const newZ = prev[2] + right.z * movementX + forward.z * movementZ;

        // Get minimum Y based on object type (simple height check)
        const minY = id.includes("sphere") ? 0.25 : 0.5;
        return [newX, Math.max(minY, newY), newZ];
      });
    },
    [camera, id],
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
        const defaultColor = id.includes("sphere")
          ? "red"
          : id.includes("box")
            ? "orange"
            : `hsl(${parseInt(id.split("-")[1]) * 70}, 100%, 50%)`;
        (materialRef.current as THREE.MeshStandardMaterial).color.set(defaultColor);
      }
    }

    if (isSelected && keysPressed.size > 0) {
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

        // Minimum height check based on object type
        const minY = id.includes("sphere") ? 0.25 : 0.5;
        return [newX, Math.max(minY, newY), newZ];
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

    // Update mesh position and rotation
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

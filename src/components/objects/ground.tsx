import * as THREE from "three";
import React from "react";

export const Ground = () => {
  const ref = React.useRef<THREE.Mesh>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.receiveShadow = true;
    }
  }, []);

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial color="gray" />
    </mesh>
  );
};

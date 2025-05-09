import { OrbitControls, Preload } from "@react-three/drei";
import { XR, createXRStore } from "@react-three/xr";
import React, { useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import Image from "next/image";
import * as THREE from "three";

import { Box, Ground, Obstacle, Sphere } from "@/components/objects";
import { useControlStore } from "@/store/z-stores/control";
import { PhysicsDebugger } from "@/components/debuggers";
import { useKeyControls } from "@/hooks";

type Position = [number, number, number];

export const SceneObjects: React.FC = () => {
  const raycaster = useRef<THREE.Raycaster>(new THREE.Raycaster());

  const obstaclePositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 5; i++) {
      positions.push([
        (Math.random() - 0.5) * 10,
        0.25,
        (Math.random() - 0.5) * 10,
      ] as Position);
    }
    return positions;
  }, []);

  useKeyControls();

  return (
    <>
      <Sphere id="sphere-1" initialPosition={[0, 0.5, 0]} raycaster={raycaster} />
      <Box
        id="box-1"
        initialPosition={[0, 0.5, 0]}
        initialRotation={[0, 0, 0]}
        raycaster={raycaster}
      />
      {obstaclePositions.map((position, index) => (
        <Obstacle
          key={`obstacle-${index}`}
          id={`obstacle-${index}`}
          position={position}
          raycaster={raycaster}
        />
      ))}
      <Ground />
    </>
  );
};

const Page = () => {
  const [sceneKey, setSceneKey] = React.useState(0);
  const { setSelectedObject } = useControlStore();

  const store = React.useMemo(
    () =>
      createXRStore({
        depthSensing: true,
      }),
    [],
  );

  const resetScene = React.useCallback(() => {
    setSceneKey((prev) => prev + 1);
    setSelectedObject(null);
  }, [setSelectedObject]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-neutral-300">
      <div className="bg-opacity-50 absolute bottom-1 left-1/2 z-10 -translate-x-1/2 rounded bg-black/50 p-4">
        <Image src="/logo.svg" alt="sodc-logo" width={100} height={25} />
      </div>
      <div className="bg-opacity-50 absolute top-1 left-1 z-10 rounded bg-black/50 p-4 text-white">
        <h3 className="mb-2 font-bold">Controls:</h3>
        <p className="text-sm">Click on object to select it (turns green)</p>
        <p className="text-sm">Selected object: WASD to move, QE for up/down</p>
        <p className="text-sm">Arrow keys: Rotate selected object</p>
        <p className="text-sm">Click and drag any object to move it</p>
        <p className="text-sm">Click on floor to deselect all objects</p>
        <button
          className="mt-2 rounded bg-blue-600 px-3 py-1 text-sm hover:bg-blue-700"
          onClick={resetScene}
        >
          Reset Scene
        </button>
      </div>

      <PhysicsDebugger />

      <Canvas
        className="h-screen w-screen"
        camera={{ position: [0, 3, 5], fov: 75, far: 1000, near: 0.1 }}
        shadows
      >
        <XR store={store}>
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableDamping={true}
            dampingFactor={0.2}
            maxPolarAngle={Math.PI / 2.2}
            minPolarAngle={Math.PI / 6}
            rotateSpeed={0.3}
            zoomToCursor
            zoom0={0.75}
            maxAzimuthAngle={Math.PI / 2}
            minAzimuthAngle={-Math.PI / 2}
          />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={1024}
          />
          <React.Suspense fallback={null}>
            <SceneObjects key={sceneKey} />
          </React.Suspense>
          <Preload all />
        </XR>
      </Canvas>
    </div>
  );
};

export default Page;

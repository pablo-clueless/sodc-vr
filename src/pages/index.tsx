import { OrbitControls, Preload } from "@react-three/drei";
import React, { Suspense, useMemo } from "react";
import { XR, createXRStore } from "@react-three/xr";
import { Physics } from "@react-three/rapier";
import { Canvas } from "@react-three/fiber";
import Image from "next/image";

import { Base, Box, Ground, Sphere } from "@/components/objects";
import { useKeyControls } from "@/hooks";
import { generateColor } from "@/lib";

type Position = [number, number, number];

export const SceneObjects: React.FC = () => {
  const color = useMemo(() => generateColor(), []);

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

  return (
    <>
      <Base
        id="box-1"
        geometry={<boxGeometry args={[1, 1, 1]} />}
        material={<meshStandardMaterial />}
        color="red"
      />
      <Sphere />
      <Box />
      {obstaclePositions.map((position, index) => (
        <Base
          key={index}
          id={`base-${index}`}
          geometry={<boxGeometry args={[1, 1, 1]} />}
          material={<meshStandardMaterial />}
          position={position}
          color={color}
        />
      ))}
      <Ground />
    </>
  );
};

const Page = () => {
  useKeyControls();

  const store = React.useMemo(
    () =>
      createXRStore({
        depthSensing: true,
      }),
    [],
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-neutral-300">
      <div className="bg-opacity-50 absolute bottom-1 left-1/2 z-10 -translate-x-1/2 rounded bg-black/50 p-4">
        <Image src="/logo.svg" alt="sodc-logo" width={100} height={25} />
      </div>
      <div className="bg-opacity-50 absolute top-1 left-1 z-10 rounded bg-black/50 p-4 text-white">
        <h3 className="mb-2 font-bold">Controls:</h3>
        <p className="text-sm">Click on object to select it (turns green)</p>
        <p className="text-sm">Selected object: WASD to move, QE for up/down</p>
        {/* <p className="text-sm">Arrow keys: Rotate selected object</p> */}
        {/* <p className="text-sm">Click any object to select it</p> */}
        <p className="text-sm">Only red objects can be selected</p>
      </div>
      <Canvas
        className="h-screen w-screen"
        camera={{ position: [0, 3, 5], fov: 75, far: 1000, near: 0.1 }}
        shadows
      >
        <Suspense>
          <Physics debug>
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
                <SceneObjects />
              </React.Suspense>
              <Preload all />
            </XR>
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Page;

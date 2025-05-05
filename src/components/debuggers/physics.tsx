import { useControlStore } from "@/store/z-stores/control";

export const PhysicsDebugger = () => {
  const { physics } = useControlStore();

  return (
    <div
      draggable
      className="absolute right-1 bottom-1 z-10 rounded-md bg-black/50 p-4 text-xs text-white"
    >
      <div>Gravity: {physics.gravity.toFixed(1)} m/s²</div>
      <div>Friction: {physics.friction.toFixed(2)}</div>
      <div>Bounciness: {physics.restitution.toFixed(2)}</div>
    </div>
  );
};

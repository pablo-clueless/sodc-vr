import type { ObjectData, Physics, Position, Velocity } from "@/types";
import { createReportableStore } from "../middleware";

interface ControlStore {
  selectedObjectId: string | null;
  setSelectedObject: (id: string | null) => void;
  keysPressed: Set<string>;
  addKeyPressed: (key: string) => void;
  removeKeyPressed: (key: string) => void;
  objects: Record<string, ObjectData>;
  updateObjectPosition: (id: string, position: Position) => void;
  updateObjectVelocity: (id: string, velocity: Velocity) => void;
  registerObject: (objectData: ObjectData) => void;
  unregisterObject: (id: string) => void;
  toggleGravity: (id: string) => void;
  physics: Physics;
}

const initialState: ControlStore = {
  selectedObjectId: null,
  setSelectedObject: () => {},
  keysPressed: new Set<string>(),
  addKeyPressed: () => {},
  removeKeyPressed: () => {},
  objects: {},
  updateObjectPosition: () => {},
  updateObjectVelocity: () => {},
  registerObject: () => {},
  unregisterObject: () => {},
  toggleGravity: () => {},
  physics: {
    gravity: 9.8,
    friction: 0.7,
    restitution: 0.6,
  },
};

const useControlStore = createReportableStore<ControlStore>((set) => ({
  ...initialState,
  selectedObjectId: null,
  setSelectedObject: (id) => set({ selectedObjectId: id }),
  keysPressed: new Set<string>(),
  addKeyPressed: (key) =>
    set((state) => {
      const newSet = new Set(state.keysPressed);
      newSet.add(key.toLowerCase());
      return { keysPressed: newSet };
    }),
  removeKeyPressed: (key) =>
    set((state) => {
      const newSet = new Set(state.keysPressed);
      newSet.delete(key.toLowerCase());
      return { keysPressed: newSet };
    }),
  updateObjectPosition: (id, position) =>
    set((state) => ({
      objects: {
        ...state.objects,
        [id]: {
          ...state.objects[id],
          position,
        },
      },
    })),
  updateObjectVelocity: (id, velocity) =>
    set((state) => ({
      objects: {
        ...state.objects,
        [id]: {
          ...state.objects[id],
          velocity,
        },
      },
    })),
  registerObject: (objectData) =>
    set((state) => ({
      objects: {
        ...state.objects,
        [objectData.id]: objectData,
      },
    })),
  unregisterObject: (id) =>
    set((state) => {
      const newObjects = { ...state.objects };
      delete newObjects[id];
      return { objects: newObjects };
    }),
  toggleGravity: (id) =>
    set((state) => ({
      objects: {
        ...state.objects,
        [id]: {
          ...state.objects[id],
          isGravityAffected: !state.objects[id].isGravityAffected,
        },
      },
    })),
}));

export { useControlStore };

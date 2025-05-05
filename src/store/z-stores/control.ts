import { createReportableStore } from "../middleware";

interface ControlStore {
  selectedObjectId: string | null;
  setSelectedObject: (id: string | null) => void;
  keysPressed: Set<string>;
  addKeyPressed: (key: string) => void;
  removeKeyPressed: (key: string) => void;
}

const initialState: ControlStore = {
  selectedObjectId: null,
  setSelectedObject: () => {},
  keysPressed: new Set(),
  addKeyPressed: () => {},
  removeKeyPressed: () => {},
};

const useControlStore = createReportableStore<ControlStore>((set) => ({
  ...initialState,
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
}));

export { useControlStore };

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserRole } from "@/types/user.types";

interface MockState {
  // When true, data screens render static mock data instead of
  // on-chain + IPFS fetched data. Toggled from the Dev Tools box.
  mockEnabled: boolean;
  // Which entity the mock UI impersonates (Client or Freelancer).
  mockRole: UserRole;
  enableMock: () => void;
  disableMock: () => void;
  setMockRole: (role: UserRole) => void;
}

export const useMockStore = create<MockState>()(
  persist(
    (set) => ({
      mockEnabled: false,
      mockRole: UserRole.Client,
      enableMock: () => set({ mockEnabled: true }),
      disableMock: () => set({ mockEnabled: false }),
      setMockRole: (role) => set({ mockRole: role }),
    }),
    {
      name: "mock-mode-storage",
    }
  )
);

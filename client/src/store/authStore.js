import { create } from "zustand";
import { persist } from "zustand/middleware";

// Small, persisted slice: just who's logged in and their house. Drill-down
// navigation state deliberately lives in the URL (React Router), not here.
export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      house: null,
      setAuth: ({ token, user, house }) => set({ token, user, house }),
      setHouse: (house) => set({ house }),
      logout: () => set({ token: null, user: null, house: null }),
    }),
    { name: "stashpoint-auth" }
  )
);

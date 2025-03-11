import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WalletData } from "@/types/wallet";

interface WalletState {
  address: string;
  inputAddress: string;
  walletData: WalletData | null;
  isLoading: boolean;
  error: Error | null;

  setAddress: (address: string) => void;
  setInputAddress: (address: string) => void;
  setWalletData: (data: WalletData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

const DEFAULT_ADDRESS = process.env.NEXT_PUBLIC_DEFAULT_ADDRESS || "";

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: DEFAULT_ADDRESS,
      inputAddress: DEFAULT_ADDRESS,
      walletData: null,
      isLoading: false,
      error: null,

      setAddress: (newAddress) => set({ address: newAddress }),
      setInputAddress: (newInputAddress) =>
        set({ inputAddress: newInputAddress }),
      setWalletData: (data) => set({ walletData: data }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: "wallet-storage",
    }
  )
);

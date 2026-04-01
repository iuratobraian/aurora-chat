import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'credit' | 'debit';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  description?: string;
}

interface WalletState {
  balance: number;
  pendingTransactions: Transaction[];
  isLoading: boolean;
  lastSyncedAt: number | null;
  
  addTransaction: (tx: Transaction) => void;
  setBalance: (balance: number) => void;
  updateTransactionStatus: (txId: string, status: Transaction['status']) => void;
  setLoading: (loading: boolean) => void;
  syncWithConvex: (balance: number, transactions: Transaction[]) => void;
  clearPending: () => void;
}

export const useWalletStore = create<WalletState>()(
  devtools(
    persist(
      (set) => ({
        balance: 0,
        pendingTransactions: [],
        isLoading: false,
        lastSyncedAt: null,

        addTransaction: (tx) =>
          set((state) => ({
            pendingTransactions: [...state.pendingTransactions, tx],
            balance: tx.type === 'credit' || tx.type === 'deposit'
              ? state.balance + tx.amount
              : state.balance - tx.amount,
          })),

        setBalance: (balance) =>
          set({ balance }),

        updateTransactionStatus: (txId, status) =>
          set((state) => ({
            pendingTransactions: state.pendingTransactions.map((tx) =>
              tx.id === txId ? { ...tx, status } : tx
            ),
          })),

        setLoading: (isLoading) => set({ isLoading }),

        syncWithConvex: (balance, transactions) =>
          set({
            balance,
            pendingTransactions: transactions.filter((t) => t.status === 'pending'),
            lastSyncedAt: Date.now(),
          }),

        clearPending: () =>
          set((state) => ({
            pendingTransactions: state.pendingTransactions.filter(
              (t) => t.status !== 'completed'
            ),
          })),
      }),
      {
        name: 'wallet-storage',
        partialize: (state: WalletState) => ({
          balance: state.balance,
          lastSyncedAt: state.lastSyncedAt,
        }),
      }
    ),
    { name: 'WalletStore' }
  )
);

interface SubscriptionState {
  currentTier: 'free' | 'pro' | 'elite' | 'vip' | null;
  expiresAt: number | null;
  features: {
    maxCommunities: number;
    canAccessPremiumSignals: boolean;
    canWithdrawInstant: boolean;
    signalDelay: number;
    maxSignalsPerDay: number;
  };
  
  setTier: (tier: SubscriptionState['currentTier'], expiresAt: number | null) => void;
  setFeatures: (features: Partial<SubscriptionState['features']>) => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  devtools(
    (set) => ({
      currentTier: null,
      expiresAt: null,
      features: {
        maxCommunities: 3,
        canAccessPremiumSignals: false,
        canWithdrawInstant: false,
        signalDelay: 60000,
        maxSignalsPerDay: 5,
      },

      setTier: (currentTier, expiresAt) => set({ currentTier, expiresAt }),

      setFeatures: (features) =>
        set((state) => ({
          features: { ...state.features, ...features },
        })),
    }),
    { name: 'SubscriptionStore' }
  )
);

export function useSubscriptionFeatures() {
  const features = useSubscriptionStore((state) => state.features);
  const currentTier = useSubscriptionStore((state) => state.currentTier);

  const canAccessPremiumSignals = currentTier === 'pro' || currentTier === 'elite' || currentTier === 'vip';
  const maxCommunities = currentTier === 'free' ? 3 : 50;
  const canWithdrawInstant = currentTier !== 'free';
  const signalDelay = currentTier === 'free' ? 60000 : 0;

  return {
    ...features,
    canAccessPremiumSignals,
    maxCommunities,
    canWithdrawInstant,
    signalDelay,
  };
}

interface AuthState {
  user: { id: string; nombre: string } | null;
  isAuthenticated: boolean;
  lastActivity: number;
  
  setUser: (user: AuthState['user']) => void;
  logout: () => void;
  updateActivity: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        lastActivity: Date.now(),

        setUser: (user) =>
          set({
            user,
            isAuthenticated: !!user,
            lastActivity: Date.now(),
          }),

        logout: () =>
          set({
            user: null,
            isAuthenticated: false,
            lastActivity: Date.now(),
          }),

        updateActivity: () => set({ lastActivity: Date.now() }),
      }),
      {
        name: 'auth-storage',
        partialize: (state: AuthState) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

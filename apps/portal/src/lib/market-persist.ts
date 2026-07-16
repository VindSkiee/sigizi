import {
  MarketFilter,
  MarketPriceStatistics,
  MarketSupplierItem,
} from "@/components/features/admin/market/types";

const MARKET_STATE_KEY = "sigizi_market_state";

export interface MarketPersistState {
  filter: MarketFilter;
  items: MarketSupplierItem[];
  rawStats: MarketPriceStatistics | null;
  cleanStats: MarketPriceStatistics | null;
  searchedItem: string;
  currentPage: number;
  showExpanded: boolean;
  requestedRadius: number | null;
  error: string | null;
  timestamp: number;
}

export function getMarketState(): MarketPersistState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MARKET_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveMarketState(
  state: Omit<MarketPersistState, "timestamp">,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    MARKET_STATE_KEY,
    JSON.stringify({ ...state, timestamp: Date.now() }),
  );
}

export function clearMarketState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MARKET_STATE_KEY);
}

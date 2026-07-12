import { DraftItem } from "@/components/features/admin/create-order/types";

const DRAFT_KEY = "sigizi_draft";

export function getDraftItems(): DraftItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDraftItems(items: DraftItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(items));
}

export function addDraftItem(item: Omit<DraftItem, "draftId" | "addedAt">): DraftItem[] {
  const items = getDraftItems();
  const newItem: DraftItem = {
    ...item,
    draftId: crypto.randomUUID(),
    addedAt: Date.now(),
  };
  const updated = [...items, newItem];
  saveDraftItems(updated);
  return updated;
}

export function removeDraftItem(draftId: string): DraftItem[] {
  const items = getDraftItems().filter((i) => i.draftId !== draftId);
  saveDraftItems(items);
  return items;
}

export function updateDraftQuantity(draftId: string, quantity: number): DraftItem[] {
  const items = getDraftItems().map((i) =>
    i.draftId === draftId ? { ...i, quantity: Math.max(1, quantity) } : i
  );
  saveDraftItems(items);
  return items;
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}

export function getDraftCount(): number {
  return getDraftItems().length;
}

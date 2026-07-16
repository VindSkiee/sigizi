import { HETReference } from "@/components/features/admin/market/types";

const HET_KEY = "sigizi_het_references";
const MAX_HET_REFERENCES = 10;

export function getHETReferences(): HETReference[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HET_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHETReferences(items: HETReference[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HET_KEY, JSON.stringify(items));
}

export function addHETReference(
  ref: Omit<HETReference, "id" | "createdAt">,
): HETReference[] {
  const items = getHETReferences();
  const newItem: HETReference = {
    ...ref,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };

  const updated = [...items, newItem];

  // Enforce max 10 limit - remove oldest if at capacity
  if (updated.length > MAX_HET_REFERENCES) {
    updated.sort((a, b) => a.createdAt - b.createdAt);
    updated.shift(); // Remove oldest
  }

  saveHETReferences(updated);
  return updated;
}

export function removeHETReference(id: string): HETReference[] {
  const items = getHETReferences().filter((i) => i.id !== id);
  saveHETReferences(items);
  return items;
}

export function formatHETLocation(location: HETReference["location"]): string {
  const parts: string[] = [];

  if (location.market && location.market !== "Semua pasar") {
    parts.push(location.market);
  } else if (location.market === "Semua pasar") {
    parts.push("Semua pasar");
  }

  if (location.district) {
    parts.push(`Kec. ${location.district}`);
  }

  parts.push(location.regency);

  return parts.join(", ");
}

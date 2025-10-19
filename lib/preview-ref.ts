import type { RightPanelRef } from '@/components/preview/right-panel';

let rightPanelRef: RightPanelRef | null = null;

export function setRightPanelRef(ref: RightPanelRef | null) {
  rightPanelRef = ref;
}

export function getRightPanelRef(): RightPanelRef | null {
  return rightPanelRef;
}


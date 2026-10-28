/**
 * Global Scroll Lock Coordinator
 *
 * Ensures that:
 * 1. Opening a modal or drawer locks both body and html scroll without layout jump.
 * 2. Nested or sequential modals (e.g., QuickView -> CartDrawer) reference-count the lock
 *    so closing one modal does not accidentally unlock while another is still open.
 * 3. Restores exact prior inline styles for overflow, overflowX, overflowY, and paddingRight.
 * 4. Preserves and restores window.scrollY so page position is never lost.
 * 5. Cleanup is fully idempotent and resilient to unexpected component unmounting.
 */

interface LockSnapshot {
  bodyOverflow: string;
  bodyOverflowY: string;
  htmlOverflow: string;
  htmlOverflowY: string;
  bodyPaddingRight: string;
  scrollY: number;
}

let activeLockCount = 0;
let snapshot: LockSnapshot = {
  bodyOverflow: '',
  bodyOverflowY: '',
  htmlOverflow: '',
  htmlOverflowY: '',
  bodyPaddingRight: '',
  scrollY: 0,
};

export const acquireScrollLock = (): (() => void) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  const docEl = document.documentElement;
  const body = document.body;

  if (activeLockCount === 0) {
    // Capture snapshot of pre-lock state
    snapshot = {
      bodyOverflow: body.style.overflow,
      bodyOverflowY: body.style.overflowY,
      htmlOverflow: docEl.style.overflow,
      htmlOverflowY: docEl.style.overflowY,
      bodyPaddingRight: body.style.paddingRight,
      scrollY: window.scrollY || window.pageYOffset || 0,
    };

    // Calculate scrollbar width to prevent content jumping when scrollbar disappears
    const scrollbarWidth = window.innerWidth - docEl.clientWidth;
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    body.style.overflow = 'hidden';
    docEl.style.overflow = 'hidden';
  }

  activeLockCount++;
  let hasReleased = false;

  return () => {
    if (hasReleased) return;
    hasReleased = true;
    activeLockCount = Math.max(0, activeLockCount - 1);

    if (activeLockCount === 0) {
      body.style.overflow = snapshot.bodyOverflow;
      body.style.overflowY = snapshot.bodyOverflowY;
      docEl.style.overflow = snapshot.htmlOverflow;
      docEl.style.overflowY = snapshot.htmlOverflowY;
      body.style.paddingRight = snapshot.bodyPaddingRight;

      // Restore original scroll position if browser drifted
      const targetY = snapshot.scrollY;
      if (typeof window.scrollTo === 'function' && Math.abs(window.scrollY - targetY) > 1) {
        window.scrollTo(0, targetY);
      }
    }
  };
};

export const getActiveScrollLockCount = (): number => activeLockCount;

export const forceResetScrollLocks = (): void => {
  activeLockCount = 0;
  if (typeof document !== 'undefined') {
    document.body.style.overflow = snapshot.bodyOverflow;
    document.body.style.overflowY = snapshot.bodyOverflowY;
    document.documentElement.style.overflow = snapshot.htmlOverflow;
    document.documentElement.style.overflowY = snapshot.htmlOverflowY;
    document.body.style.paddingRight = snapshot.bodyPaddingRight;
  }
};

const listeners = new Set();
const activeOperations = new Map();
const emptySnapshot = Object.freeze({ active: false, message: '' });
let snapshot = emptySnapshot;

const publish = () => {
  const message = activeOperations.values().next().value;
  snapshot = message ? { active: true, message } : emptySnapshot;
  listeners.forEach(listener => listener());
};

export const subscribeLearningActivity = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getLearningActivitySnapshot = () => snapshot;

/* The overlay must never stay pinned over the portal: if a request stalls (very
   slow or offline network) the overlay clears after this window while the
   request itself keeps running in the background. */
const MAX_OVERLAY_MS = 20 * 1000;

export const runWithLearningActivity = async (message, operation) => {
  const operationId = Symbol(message);
  const startedAt = Date.now();
  activeOperations.set(operationId, message);
  publish();

  const overlayWatchdog = window.setTimeout(() => {
    if (activeOperations.delete(operationId)) publish();
  }, MAX_OVERLAY_MS);

  try {
    return await operation();
  } finally {
    window.clearTimeout(overlayWatchdog);
    const remainingDisplayTime = 350 - (Date.now() - startedAt);
    if (remainingDisplayTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingDisplayTime));
    }
    if (activeOperations.delete(operationId)) publish();
  }
};
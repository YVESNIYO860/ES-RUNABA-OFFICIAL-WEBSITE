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

export const runWithLearningActivity = async (message, operation) => {
  const operationId = Symbol(message);
  const startedAt = Date.now();
  activeOperations.set(operationId, message);
  publish();

  try {
    return await operation();
  } finally {
    const remainingDisplayTime = 350 - (Date.now() - startedAt);
    if (remainingDisplayTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingDisplayTime));
    }
    activeOperations.delete(operationId);
    publish();
  }
};
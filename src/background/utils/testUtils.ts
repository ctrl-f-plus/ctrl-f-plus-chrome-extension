// src/background/utils/testUtils.ts

import store from '../store/databaseStore';

export default function updateStoreForTesting() {
  Object.keys(store.windowStores).forEach((windowId) => {
    const windowStore = store.windowStores[windowId];
    windowStore.toggleShowFields(true);
  });
}

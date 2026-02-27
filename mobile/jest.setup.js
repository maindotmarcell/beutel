// Mock expo-secure-store
jest.mock("expo-secure-store", () => {
  const store = {};
  return {
    setItemAsync: jest.fn(async (key, value) => {
      store[key] = value;
    }),
    getItemAsync: jest.fn(async (key) => store[key] ?? null),
    deleteItemAsync: jest.fn(async (key) => {
      delete store[key];
    }),
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 6,
    __store: store,
    __clear: () => {
      for (const key of Object.keys(store)) delete store[key];
    },
  };
});

// Mock expo-constants
jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {
      backendUrl: "http://localhost:3000",
    },
  },
}));

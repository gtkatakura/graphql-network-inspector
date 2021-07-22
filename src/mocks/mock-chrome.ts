import { mockRequests } from "../mocks/mock-requests";

let listeners: Array<() => void> = [];
const removeListeners = () => {
  while (listeners.length) {
    const listener = listeners.shift();
    if (listener) {
      listener();
    }
  }
};

export const mockChrome = {
  devtools: {
    network: {
      onRequestFinished: {
        addListener: (cb) => {
          mockRequests.forEach((mockRequest) => {
            cb(mockRequest as any);
          });

          // On press key "1", add more mock requests to app
          const handleKeydown = (e: KeyboardEvent) => {
            if (e.code === "Digit1") {
              mockRequests.forEach((mockRequest) => {
                cb(mockRequest as any);
              });
            }
          };
          window.addEventListener("keydown", handleKeydown);
          listeners.push(() => {
            window.removeEventListener("keydown", handleKeydown);
          });
        },
        removeListener: (cb) => {
          removeListeners();
        },
      },
      onNavigated: {
        addListener: (cb) => {},
        removeListener: (cb) => {},
      },
    },
  },
} as typeof chrome;

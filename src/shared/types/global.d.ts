import type { AppApi } from "../../preload";

declare global {
  interface Window {
    app: AppApi;
  }
}

export {};

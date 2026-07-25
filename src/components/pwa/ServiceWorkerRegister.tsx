"use client";

import { useEffect } from "react";

/**
 * PWA Foundation: register Service Worker only.
 * No Cache / Offline / Push / Background Sync.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!("serviceWorker" in navigator)) {
      return;
    }

    void navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.debug("[PWA] Service Worker registration failed", error);
    });
  }, []);

  return null;
}

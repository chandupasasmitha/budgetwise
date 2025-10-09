"use client";

import { useEffect } from "react";

export default function KeyboardListener() {
  useEffect(() => {
    const doc = document.documentElement;

    function setKeyboardOpen(open: boolean, offset = 0) {
      if (open) {
        doc.classList.add("keyboard-open");
        doc.style.setProperty("--keyboard-offset", `${offset}px`);
      } else {
        doc.classList.remove("keyboard-open");
        doc.style.setProperty("--keyboard-offset", `0px`);
      }
    }

    let lastInnerHeight = window.innerHeight;

    // visualViewport API is the most reliable on modern mobile browsers
    const onVisualViewport = () => {
      const vv = window.visualViewport;
      if (!vv) return;
      const heightDiff = window.innerHeight - vv.height;
      const isOpen = heightDiff > 150; // heuristic: keyboard typically >150px
      setKeyboardOpen(isOpen, Math.max(0, heightDiff));
    };

    const onResize = () => {
      // fallback if visualViewport is not available
      const heightDiff = Math.max(0, lastInnerHeight - window.innerHeight);
      const isOpen = heightDiff > 150;
      lastInnerHeight = Math.max(lastInnerHeight, window.innerHeight);
      setKeyboardOpen(isOpen, heightDiff);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", onVisualViewport);
      window.visualViewport.addEventListener("scroll", onVisualViewport);
      // initial check
      onVisualViewport();
    } else {
      window.addEventListener("resize", onResize);
    }

    // Also handle focus on inputs to ensure UI adjusts immediately
    const focusInHandler = () =>
      setTimeout(() => {
        if (window.visualViewport) onVisualViewport();
        else onResize();
      }, 50);
    const focusOutHandler = () => setKeyboardOpen(false);
    document.addEventListener("focusin", focusInHandler);
    document.addEventListener("focusout", focusOutHandler);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", onVisualViewport);
        window.visualViewport.removeEventListener("scroll", onVisualViewport);
      } else {
        window.removeEventListener("resize", onResize);
      }
      document.removeEventListener("focusin", focusInHandler);
      document.removeEventListener("focusout", focusOutHandler);
    };
  }, []);

  return null;
}

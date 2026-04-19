"use client";

import { useState, useCallback, useRef } from "react";

/**
 * Copy text to clipboard with fallback for environments where navigator.clipboard is unavailable.
 * Supports: modern browsers, SSR (when navigator is undefined), non-HTTPS contexts.
 * @param {number} resetDelay - Time in ms before resetting copied state (default: 2000)
 * @returns {{ copied: string|null, copy: (text: string, id?: string) => void }}
 */
export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(null);
  const timeoutRef = useRef(null);

  const copy = useCallback(async (text, id = "default") => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback: create a textarea, copy from it, remove it
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
        } finally {
          document.body.removeChild(textarea);
        }
      }
    } catch (err) {
      // Last-resort fallback: create textarea without explicit selection
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
      } finally {
        if (document.body.contains(textarea)) {
          document.body.removeChild(textarea);
        }
      }
    }
    setCopied(id);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setCopied(null);
    }, resetDelay);
  }, [resetDelay]);

  return { copied, copy };
}

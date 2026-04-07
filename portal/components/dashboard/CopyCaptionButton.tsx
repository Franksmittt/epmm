"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { premiumSpring } from "@/lib/motion";

interface CopyCaptionButtonProps {
  text: string;
}

export function CopyCaptionButton({ text }: CopyCaptionButtonProps) {
  const [show, setShow] = useState(false);

  async function onCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setShow(true);
      window.setTimeout(() => setShow(false), 2200);
    } catch {
      setShow(true);
      window.setTimeout(() => setShow(false), 2200);
    }
  }

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={onCopy}
        className="rounded-md border border-white/20 bg-black px-3 py-2 text-xs font-medium text-white"
      >
        Copy text
      </button>
      <AnimatePresence>
        {show ? (
          <motion.span
            role="status"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={premiumSpring}
            className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/20 bg-[#1D1D1F] px-3 py-1.5 text-xs text-white shadow-lg"
          >
            Copied to clipboard
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}

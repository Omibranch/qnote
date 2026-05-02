import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const KEY = "qnote_grid_hint_shown";

export function GridHintToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) {
      localStorage.setItem(KEY, "1");
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="grid-hint-toast"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
        >
          <span className="grid-hint-text">
            If the app feels laggy, you can turn off the grid in Settings.
          </span>
          <button className="icon-btn update-toast-close" onClick={() => setVisible(false)}>
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

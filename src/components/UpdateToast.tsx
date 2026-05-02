import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const DISMISS_KEY = "qnote_dismissed_update";
const RELEASES_URL = "https://github.com/Omibranch/qnote/releases/latest";

export function UpdateToast() {
  const [installed, setInstalled] = useState("");
  const [latest, setLatest] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    getVersion().then((v) => {
      setInstalled(v);
      fetch("https://api.github.com/repos/Omibranch/qnote/releases/latest")
        .then((r) => r.json())
        .then((d) => {
          const tag = (d.tag_name as string).replace(/^v/, "");
          if (tag !== v && localStorage.getItem(DISMISS_KEY) !== tag) {
            setLatest(tag);
            setVisible(true);
          }
        })
        .catch(() => {});
    });
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, latest);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="update-toast"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
        >
          <div className="update-toast-body">
            <span className="update-toast-title">Update available</span>
            <span className="update-toast-versions">{installed} → {latest}</span>
          </div>
          <button
            className="update-toast-link"
            onClick={() => openUrl(RELEASES_URL)}
          >
            Release notes
          </button>
          <button className="icon-btn update-toast-close" onClick={dismiss}>
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

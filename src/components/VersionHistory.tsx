import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Trash2 } from "lucide-react";
import { useStore } from "../store/useStore";
import { api } from "../lib/api";
import type { VersionEntry } from "../store/useStore";

type Filter = "hour" | "day" | "week" | "all";

const FILTER_MS: Record<Filter, number> = {
  hour: 60 * 60_000,
  day: 24 * 60 * 60_000,
  week: 7 * 24 * 60 * 60_000,
  all: Infinity,
};

const FILTER_LABELS: Record<Filter, string> = {
  hour: "Last hour",
  day: "Last day",
  week: "Last week",
  all: "All",
};

function formatTs(ms: number): string {
  const d = new Date(ms);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `Today ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();
  if (isYesterday) return `Yesterday ${time}`;

  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${time}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function VersionHistory() {
  const { historyPanelOpen, setHistoryPanelOpen, filePath, setContent, content } = useStore();
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [filter, setFilter] = useState<Filter>("day");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!historyPanelOpen || !filePath) return;
    setLoading(true);
    setExpanded(null);
    setPreview(null);
    api.listVersions(filePath).then((vs) => {
      setVersions(vs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [historyPanelOpen, filePath]);

  const now = Date.now();
  const filtered = versions.filter((v) =>
    filter === "all" ? true : now - v.timestamp_ms <= FILTER_MS[filter]
  );

  const handleExpand = async (ts: number) => {
    if (expanded === ts) {
      setExpanded(null);
      setPreview(null);
      return;
    }
    setExpanded(ts);
    setPreview(null);
    if (!filePath) return;
    try {
      const text = await api.readVersion(filePath, ts);
      setPreview(text);
    } catch {
      setPreview("(failed to load)");
    }
  };

  const handleRestore = async (ts: number) => {
    if (!filePath) return;
    try {
      const text = await api.readVersion(filePath, ts);
      // Save current state as a version before restoring
      await api.saveVersion(filePath, content).catch(() => {});
      setContent(text);
      setHistoryPanelOpen(false);
    } catch (err) {
      alert(String(err));
    }
  };

  const handleDelete = async (ts: number) => {
    if (!filePath) return;
    try {
      await api.deleteVersion(filePath, ts);
      setVersions((vs) => vs.filter((v) => v.timestamp_ms !== ts));
      if (expanded === ts) { setExpanded(null); setPreview(null); }
    } catch (err) {
      alert(String(err));
    }
  };

  const close = () => setHistoryPanelOpen(false);

  return (
    <AnimatePresence>
      {historyPanelOpen && (
        <motion.div
          key="vh-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="settings-overlay"
          onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <motion.div
            key="vh-panel"
            initial={{ scale: 0.97, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 500, damping: 42 }}
            className="settings-panel vh-panel"
          >
            <div className="settings-header">
              <h2 className="settings-title">Version history</h2>
              <button className="icon-btn" onClick={close}><X size={17} /></button>
            </div>

            <div className="vh-filters">
              {(["hour", "day", "week", "all"] as Filter[]).map((f) => (
                <button
                  key={f}
                  className={`vh-filter-btn${filter === f ? " active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {FILTER_LABELS[f]}
                </button>
              ))}
            </div>

            <div className="vh-body">
              {loading && <p className="vh-empty">Loading...</p>}
              {!loading && filtered.length === 0 && (
                <p className="vh-empty">No versions in this range.</p>
              )}
              {!loading && filtered.map((v) => (
                <div key={v.timestamp_ms} className="vh-item">
                  <div
                    className="vh-item-header"
                    onClick={() => handleExpand(v.timestamp_ms)}
                  >
                    <span className="vh-ts">{formatTs(v.timestamp_ms)}</span>
                    <span className="vh-size">{formatSize(v.size)}</span>
                  </div>
                  {v.preview && (
                    <p className="vh-preview">{v.preview}</p>
                  )}
                  {expanded === v.timestamp_ms && (
                    <div className="vh-expanded">
                      <pre className="vh-content">
                        {preview === null ? "Loading..." : preview}
                      </pre>
                      <div className="vh-actions">
                        <button
                          className="btn-primary vh-restore-btn"
                          onClick={() => handleRestore(v.timestamp_ms)}
                        >
                          <RotateCcw size={14} />
                          Restore
                        </button>
                        <button
                          className="btn-ghost vh-delete-btn"
                          onClick={() => handleDelete(v.timestamp_ms)}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

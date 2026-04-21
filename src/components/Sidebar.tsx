import { motion, AnimatePresence } from "framer-motion";
import { FileText, Clock, X, Search } from "lucide-react";
import { useStore, type HistoryEntry } from "../store/useStore";
import { api } from "../lib/api";
import { useState, useEffect, useRef } from "react";

const GROUP_ORDER = ["Today", "Yesterday", "Earlier"];

function groupByDay(entries: HistoryEntry[]): Record<string, HistoryEntry[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return entries.reduce<Record<string, HistoryEntry[]>>((acc, entry) => {
    const d = new Date(entry.last_opened * 1000);
    d.setHours(0, 0, 0, 0);
    const group =
      d >= today ? "Today" : d >= yesterday ? "Yesterday" : "Earlier";
    (acc[group] ??= []).push(entry);
    return acc;
  }, {});
}

function shortenPath(full: string): string {
  return full.replace(/^\/home\/[^/]+/, "~");
}

export function Sidebar() {
  const { history, sidebarOpen, setSidebarOpen, openFile, setHistory } =
    useStore();

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<HistoryEntry[] | null>(null);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sidebarOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery("");
      setSearchResults(null);
    }
  }, [sidebarOpen]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSearchResults(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await api.searchFiles(query.trim());
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 320);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleOpen = async (entry: HistoryEntry) => {
    try {
      const content = await api.readFile(entry.path);
      openFile(entry.path, entry.title, content);
      await api.addToHistory(entry.path, entry.title);
      const updated = await api.getHistory();
      setHistory(updated);
      setSidebarOpen(false);
    } catch {
      const updated = await api.getHistory();
      setHistory(updated);
    }
  };

  const displayEntries = searchResults ?? history;
  const groups = groupByDay(displayEntries);
  const isSearching = query.trim().length > 0;

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
          />
          <motion.aside
            key="sidebar"
            initial={{ x: -270 }}
            animate={{ x: 0 }}
            exit={{ x: -270 }}
            transition={{ type: "spring", stiffness: 420, damping: 42 }}
            className="sidebar"
          >
            <div className="sidebar-header">
              <span className="sidebar-title">Recent Files</span>
              <button
                className="icon-btn"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={15} />
              </button>
            </div>

            <div className="sidebar-search">
              <Search size={13} className="sidebar-search-icon" />
              <input
                ref={inputRef}
                className="sidebar-search-input"
                type="text"
                placeholder="Search files..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                spellCheck={false}
              />
              {query && (
                <button
                  className="sidebar-search-clear"
                  onClick={() => setQuery("")}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="sidebar-content">
              {searching ? (
                <div className="sidebar-empty">
                  <span className="sidebar-searching">Searching...</span>
                </div>
              ) : isSearching && displayEntries.length === 0 ? (
                <div className="sidebar-empty">
                  <Search size={22} strokeWidth={1.5} />
                  <span>No results</span>
                </div>
              ) : !isSearching && displayEntries.length === 0 ? (
                <div className="sidebar-empty">
                  <Clock size={22} strokeWidth={1.5} />
                  <span>No recent files</span>
                </div>
              ) : isSearching ? (
                <div className="history-group">
                  <div className="history-group-label">
                    {displayEntries.length} {displayEntries.length === 1 ? "result" : "results"}
                  </div>
                  {displayEntries.map((entry) => (
                    <button
                      key={entry.path}
                      className="history-item"
                      onClick={() => handleOpen(entry)}
                    >
                      <FileText size={13} strokeWidth={1.5} className="history-icon" />
                      <div className="history-item-text">
                        <span className="history-name">{entry.title}</span>
                        <span className="history-path">{shortenPath(entry.path)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                GROUP_ORDER.map((group) =>
                  groups[group]?.length ? (
                    <div key={group} className="history-group">
                      <div className="history-group-label">{group}</div>
                      {groups[group].map((entry) => (
                        <button
                          key={entry.path}
                          className="history-item"
                          onClick={() => handleOpen(entry)}
                        >
                          <FileText
                            size={13}
                            strokeWidth={1.5}
                            className="history-icon"
                          />
                          <div className="history-item-text">
                            <span className="history-name">{entry.title}</span>
                            <span className="history-path">
                              {shortenPath(entry.path)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : null
                )
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

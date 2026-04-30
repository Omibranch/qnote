import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useStore, type Settings as SettingsType } from "../store/useStore";
import { api } from "../lib/api";

const CURATED_FONTS = [
  "JetBrains Mono",
  "Fira Code",
  "Cascadia Code",
  "Source Code Pro",
  "Hack",
  "Ubuntu Mono",
  "Inconsolata",
  "Roboto Mono",
  "Noto Sans Mono",
  "Inter",
  "IBM Plex Mono",
  "IBM Plex Sans",
  "Geist Mono",
];

export function Settings() {
  const { settingsOpen, setSettingsOpen, settings, updateSettings } =
    useStore();
  const [systemFonts, setSystemFonts] = useState<string[]>([]);
  const [draft, setDraft] = useState<SettingsType>(settings);

  // Sync draft when settings change externally or panel opens
  useEffect(() => {
    if (settingsOpen) {
      setDraft(settings);
      api.getSystemFonts().then((fonts) => {
        setSystemFonts(fonts);
      });
    }
  }, [settingsOpen]);

  const updateDraft = (patch: Partial<SettingsType>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const allFonts = [
    ...new Set([...CURATED_FONTS, ...systemFonts]),
  ].sort((a, b) => a.localeCompare(b));

  const handleSave = async () => {
    updateSettings(draft);
    await api.saveSettings(draft);
    setSettingsOpen(false);
  };

  const handleCancel = () => {
    setDraft(settings);
    setSettingsOpen(false);
  };

  return (
    <AnimatePresence>
      {settingsOpen && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="settings-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) handleCancel();
          }}
        >
          <motion.div
            key="panel"
            initial={{ scale: 0.97, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 500, damping: 42 }}
            className="settings-panel"
          >
            <div className="settings-header">
              <h2 className="settings-title">Settings</h2>
              <button className="icon-btn" onClick={handleCancel}>
                <X size={17} />
              </button>
            </div>

            <div className="settings-body">
              <div className="settings-section">
                <h3 className="settings-section-title">Appearance</h3>

                <div className="settings-row">
                  <label>Theme</label>
                  <div className="theme-toggle">
                    {(["dark", "light"] as const).map((t) => (
                      <button
                        key={t}
                        className={`theme-btn${draft.theme === t ? " active" : ""}`}
                        onClick={() => updateDraft({ theme: t })}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-row">
                  <label>Editor font</label>
                  <select
                    className="settings-select"
                    value={draft.font_family}
                    onChange={(e) =>
                      updateDraft({ font_family: e.target.value })
                    }
                  >
                    {allFonts.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="settings-row">
                  <label>
                    Font size
                    <span className="label-suffix">{draft.font_size}px</span>
                  </label>
                  <input
                    type="range"
                    min={11}
                    max={24}
                    step={1}
                    className="settings-range"
                    value={draft.font_size}
                    onChange={(e) =>
                      updateDraft({ font_size: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="settings-row">
                  <label>
                    Line height
                    <span className="label-suffix">{draft.line_height.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min={1.2}
                    max={2.4}
                    step={0.05}
                    className="settings-range"
                    value={draft.line_height}
                    onChange={(e) =>
                      updateDraft({ line_height: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="settings-section">
                <h3 className="settings-section-title">Storage</h3>
                <div className="settings-row">
                  <label>History retention</label>
                  <div className="input-suffix-group">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      className="settings-number-input"
                      value={draft.retention_days}
                      onChange={(e) =>
                        updateDraft({
                          retention_days: Math.max(
                            1,
                            Math.min(365, Number(e.target.value))
                          ),
                        })
                      }
                    />
                    <span>days</span>
                  </div>
                </div>
                <div className="settings-row">
                  <label>
                    Auto-version interval
                    <span className="label-suffix">{draft.version_interval_minutes} min</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    step={1}
                    className="settings-range"
                    value={draft.version_interval_minutes}
                    onChange={(e) =>
                      updateDraft({ version_interval_minutes: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
            </div>

              <div className="settings-section">
                <h3 className="settings-section-title">Developer</h3>
                <div className="settings-row">
                  <label>Debug console</label>
                  <div className="theme-toggle">
                    {([false, true] as const).map((v) => (
                      <button
                        key={String(v)}
                        className={`theme-btn${draft.debug_mode === v ? " active" : ""}`}
                        onClick={() => updateDraft({ debug_mode: v })}
                      >
                        {v ? "On" : "Off"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            <div className="settings-footer">
              <button className="btn-ghost" onClick={handleCancel}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSave}>
                Save changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

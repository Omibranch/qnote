import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";

type LogLevel = "log" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  msg: string;
  time: string;
}

function formatArgs(args: unknown[]): string {
  return args
    .map((a) => {
      if (a === null) return "null";
      if (a === undefined) return "undefined";
      if (typeof a === "object") {
        try { return JSON.stringify(a, null, 2); } catch { return String(a); }
      }
      return String(a);
    })
    .join(" ");
}

function ts(): string {
  return new Date().toTimeString().slice(0, 8);
}

export function DebugConsole() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);

  useEffect(() => {
    const orig = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };

    const push = (level: LogLevel, args: unknown[]) => {
      setLogs((prev) => [...prev, { level, msg: formatArgs(args), time: ts() }]);
    };

    console.log = (...a) => { orig.log(...a); push("log", a); };
    console.info = (...a) => { orig.info(...a); push("info", a); };
    console.warn = (...a) => { orig.warn(...a); push("warn", a); };
    console.error = (...a) => { orig.error(...a); push("error", a); };

    return () => {
      console.log = orig.log;
      console.info = orig.info;
      console.warn = orig.warn;
      console.error = orig.error;
    };
  }, []);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    if (atBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logs]);

  const handleScroll = () => {
    const el = bodyRef.current;
    if (!el) return;
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  };

  return (
    <div className="debug-console">
      <div className="debug-console-toolbar">
        <span className="debug-console-title">Debug Console</span>
        <button
          className="debug-console-clear"
          title="Clear"
          onClick={() => setLogs([])}
        >
          <Trash2 size={12} />
          Clear
        </button>
      </div>
      <div className="debug-console-body" ref={bodyRef} onScroll={handleScroll}>
        {logs.length === 0 && (
          <span className="debug-console-empty">No logs yet</span>
        )}
        {logs.map((entry, i) => (
          <div key={i} className={`debug-log debug-log-${entry.level}`}>
            <span className="debug-log-time">{entry.time}</span>
            <span className="debug-log-level">{entry.level.toUpperCase()}</span>
            <span className="debug-log-msg">{entry.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

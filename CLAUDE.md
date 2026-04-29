# qnote — project context

Minimal, beautiful frameless notepad. Tauri 2 + React/TypeScript + Vite.
Author: Omi. Version: 0.1.1. Target: Arch Linux (+ Windows/macOS).
Available on AUR. README.md exists at root.

---

## Как общаться с Оми

Пиши **на русском**. Всегда. Даже если ты внутри думаешь на английском — отвечай по-русски.

Будь **живым**: добрым, шутливым, немного ироничным, чуть саркастичным там, где это уместно. Не надо быть роботом-автоответчиком. Оми — человек, который делает крутой проект, и ему приятнее работать с кем-то, у кого есть характер, а не с корпоративной болванкой.

Примеры того, как надо:
- "ну да, там был баг — типичная классика, забыли вызвать `handle_cli()` перед запуском GUI"
- "это уже работает, можно не трогать — и слава богу"
- "pdf теперь настоящий, не html в маскарадном костюме"

Примеры того, как не надо:
- "Отличный вопрос! Я был бы рад помочь вам с этой задачей."
- "Конечно! Вот пошаговое руководство..."
- эмодзи (никогда, ни при каких обстоятельствах)

---

## Stack

- **Frontend**: React 18, TypeScript, Vite, Zustand, framer-motion, lucide-react, marked
- **Backend**: Rust, Tauri 2 (tauri-plugin-opener, tauri-plugin-dialog)
- **CSS**: кастомные CSS-переменные в `src/index.css` (без Tailwind в рантайме — только переменные и классы)
- **Extra deps**: pulldown-cmark (md→typst), sha1, chrono, dirs

---

## File structure

```
src-tauri/src/
  main.rs            entry point — вызывает handle_cli() затем run()
  lib.rs             ВСЕ Rust-команды (см. ниже)
src/
  App.tsx            root: клавиатурные шорткаты, init (settings/history/env/platform)
  components/
    Header.tsx         тулбар: файловые кнопки, PDF, HTML, OCR, версии, MD-переключатель
    Sidebar.tsx        история файлов + поиск
    Editor.tsx         textarea + debounced auto-save + авто-версионирование
    MarkdownEditor.tsx split source/preview
    Settings.tsx       модалка настроек
    VersionHistory.tsx модалка истории версий
  lib/
    api.ts           все Tauri invoke-обёртки
    fileOps.ts       open/save file helpers
    pdfExport.ts     exportPdf() → Rust/typst; exportHtml() → HTML-файл
  store/
    useStore.ts      Zustand store (Settings, AppState, VersionEntry)
  index.css          CSS vars + все стили компонентов
```

---

## Rust commands (lib.rs)

- `read_file`, `write_file`
- `get_history`, `add_to_history` — `~/.local/share/qnote/history.json`
- `get_settings`, `save_settings` — `~/.local/share/qnote/settings.json`
- `get_system_fonts` — fc-list
- `get_desktop_env` — XDG_CURRENT_DESKTOP
- `get_platform` — std::env::consts::OS ("linux" / "windows" / "macos")
- `search_files`
- `export_pdf(save_path, content, is_markdown, title, settings)` — typst CLI; нужен `typst` в PATH
- `ocr_image(path)` — tesseract; пробует eng+rus, фолбэк на eng
- `save_version(file_path, content)` — дедупликация, максимум 200 на файл; возвращает `Option<VersionEntry>`
- `list_versions(file_path)` → `Vec<VersionEntry>`
- `read_version(file_path, timestamp_ms)` → `String`
- `delete_version(file_path, timestamp_ms)`
- `handle_cli()` — обрабатывает `qnote ocr <path>`, `--help`, `--version`; **вызывается в main.rs ДО run()**

Версии лежат тут: `~/.local/share/qnote/versions/<sha1(path)>/<ts_ms>.snap`

---

## Settings struct (Rust + TS — синхронизированы)

```
retention_days: u32             (default 7)
font_family: String             (default "JetBrains Mono")
font_size: u32                  (default 15)
theme: String                   ("dark" | "light")
line_height: f32                (default 1.7)
version_interval_minutes: u32   (default 10)
```

TS-интерфейс `Settings` в `useStore.ts` и Rust-структура `Settings` в `lib.rs` — **полностью совпадают**.

---

## Что сделано (статус реализации)

Всё перечисленное ниже **реализовано и компилируется без ошибок**:

- `main.rs` вызывает `handle_cli()` перед `run()` — CLI работает
- `exportPdf()` вызывает Rust/typst, сохраняет настоящий PDF с темой
- `exportHtml()` — отдельная функция, сохраняет красивый HTML
- OCR кнопка в хедере: открывает диалог выбора картинки, вызывает tesseract, вставляет текст в заметку
- Version History кнопка в хедере: открывает `VersionHistory.tsx`
- `VersionHistory.tsx`: фильтры (Last hour / Last day / Last week / All), список версий, раскрытие с превью, Restore (сохраняет текущее состояние перед откатом), Delete
- `Editor.tsx`: сохраняет версию при открытии файла; если файл открыт дольше 1 часа — сохраняет каждые N минут (рефы, без stale closure)
- `Settings.tsx`: слайдер "Auto-version interval" в разделе Storage
- `useStore.ts`: `VersionEntry`, `version_interval_minutes`, `historyPanelOpen` / `setHistoryPanelOpen`
- `api.ts`: все вызовы полные — `getPlatform`, `exportPdf`, `ocrImage`, `openImageDialog`, `saveVersion`, `listVersions`, `readVersion`, `deleteVersion`
- `App.tsx`: window controls показываются при `isDE || platform === "windows"`

---

## Theme / design tokens

Dark: bg `#0e0e10`, accent `#8b7cf8`, text `#e8e8ec`, surface `rgba(255,255,255,0.04)`
Light: bg `#f2f2f5`, accent `#6c5ce7`, text `#111115`
CSS классы: `.dark` / `.light` на `.app`. Переменные: `--bg`, `--accent`, `--text`, `--text-2`, `--text-3`, `--bg-elevated`, `--bg-elevated2`, `--border`, `--border-strong`, `--shadow`

---

## Tauri config

`decorations: false` (frameless). Window controls рендерятся в `Header.tsx`, показываются только при `showWindowControls === true` в сторе (KDE/GNOME/... или Windows).

---

## Tauri invoke — именование параметров

Всегда snake_case, совпадающий с именами Rust-параметров:
```ts
invoke("export_pdf", { save_path, content, is_markdown, title, settings })
invoke("save_version", { file_path, content })
invoke("list_versions", { file_path })
invoke("read_version", { file_path, timestamp_ms })
invoke("delete_version", { file_path, timestamp_ms })
invoke("ocr_image", { path })
```

---

## CSS — что переиспользовать

Готовые классы: `.settings-overlay`, `.settings-panel`, `.settings-header`, `.settings-title`, `.settings-body`, `.settings-footer`, `.theme-toggle`, `.theme-btn`, `.btn-primary`, `.btn-ghost`, `.icon-btn`, `.win-controls-divider`

Классы для Version History (уже добавлены в `index.css`): `.vh-panel`, `.vh-filters`, `.vh-filter-btn`, `.vh-body`, `.vh-empty`, `.vh-item`, `.vh-item-header`, `.vh-ts`, `.vh-size`, `.vh-preview`, `.vh-expanded`, `.vh-content`, `.vh-actions`, `.vh-restore-btn`, `.vh-delete-btn`

---

## Release / publish checklist

- `pnpm build` + `cargo tauri build` — убедиться что компилируется
- Обновить `version` в `tauri.conf.json` и `Cargo.toml`
- Обновить `README.md` (фичи, инструкции)
- `git tag vX.Y.Z && git push --tags` — запускает release CI (`.github/workflows/release.yml`)
- Обновить AUR PKGBUILD (отдельный AUR-репо)
- Claude — не контрибьютор, не упоминать нигде

<!-- qnote_logo -->
<img src='https://i.ibb.co/YByQ9xr6/qnote-logo.jpg'>
<div align="center">

# qnote

[![License: MIT](https://img.shields.io/badge/License-MIT-8b7cf8?style=flat-square)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2.x-24c8db?style=flat-square&logo=tauri)](https://tauri.app)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Rust](https://img.shields.io/badge/Rust-stable-ce422b?style=flat-square&logo=rust)](https://www.rust-lang.org)
[![Platform](https://img.shields.io/badge/Platform-Linux%20%7C%20Windows%20%7C%20macOS-fcc624?style=flat-square&logo=apple&logoColor=333)](https://github.com/Omibranch/qnote/releases)

**Minimalistic pretty file redactor.**

[English](#english) · [Русский](#russian)

</div>

---

<a name="english"></a>

## English

qnote is a lightweight desktop note editor built with Tauri v2 + React. It supports Markdown with live preview, file history with search, real PDF export, OCR, version history, and a custom-styled frameless window. Works on Linux, Windows, and macOS.

### Features

- Plain text and Markdown (`.md`) editing in one app
- Live Markdown preview with GFM and HTML support
- Formatting toolbar: headings, bold, italic, code, blockquotes, tables, links, images
- Keyboard shortcuts work regardless of active keyboard layout
- Collapsible editor pane in Preview mode
- File history grouped by day with fast search by filename and content
- **Version history** — automatic snapshots on open and periodically; browse, preview, restore, or delete any version
- **PDF export** — real PDF generated via [typst](https://typst.app), styled to match your current theme (requires `typst` in PATH)
- **HTML export** — styled standalone HTML document
- **OCR** — extract text from images via [tesseract](https://github.com/tesseract-ocr/tesseract), appended directly to your note (requires `tesseract` in PATH)
- CLI: `qnote ocr <image>` — OCR from terminal, prints result to stdout
- Dark and light themes
- Auto-save for already-saved files
- New files default to `.txt` extension
- Configurable font, size, and line height
- Custom window controls (on KDE, GNOME, and other DEs; always shown on Windows and macOS)
- RTL support (Arabic, Hebrew, etc.)
- No internet required, no server

| Dark-1 | Dark-2 | Lite-1 | Lite-2 |
| :---: | :---: | :---: | :---: |
| ![D1](https://i.ibb.co/SD9bzS9H/qnote-1dark.jpg) | ![D2](https://i.ibb.co/qF1W4FY9/qnote-2dark.jpg) | ![L1](https://i.ibb.co/pjhnRBVY/qnote-1lite.jpg) | ![L2](https://i.ibb.co/DPJmmrvy/qnote-2lite.jpg) |

### Installation

#### AUR (Arch Linux)

```bash
yay -S qnote
# or
paru -S qnote
```

#### Linux binary / AppImage / deb

Download from the [Releases](https://github.com/Omibranch/qnote/releases) page:

| Package | Notes |
|---------|-------|
| `qnote-linux-x86_64` | Raw binary, run directly |
| `qnote_*.AppImage` | Portable, no install needed |
| `qnote_*.deb` | Debian/Ubuntu package |

> **Note:** The binary and AppImage require system WebKit libraries. On Ubuntu/Debian:
> ```bash
> sudo apt install libwebkit2gtk-4.1-0 libgtk-3-0
> ```

```bash
chmod +x qnote-linux-x86_64
./qnote-linux-x86_64
```

#### Windows

Download from the [Releases](https://github.com/Omibranch/qnote/releases) page:

| Package | Notes |
|---------|-------|
| `qnote_*_x64-setup.exe` | NSIS installer, installs to Program Files |
| `qnote-windows-portable.exe` | Portable, no install needed |

WebView2 is included with Windows 11 and installed automatically on Windows 10 if missing.

#### macOS

Download from the [Releases](https://github.com/Omibranch/qnote/releases) page:

| Package | Notes |
|---------|-------|
| `qnote_*.dmg` | Disk image, drag qnote.app to Applications |
| `qnote.app` | App bundle, run directly |

#### Optional dependencies

| Feature | Dependency |
|---------|------------|
| PDF export | [typst](https://typst.app) — `sudo pacman -S typst` / [typst releases](https://github.com/typst/typst/releases) |
| OCR | [tesseract](https://github.com/tesseract-ocr/tesseract) — `sudo pacman -S tesseract tesseract-data-eng tesseract-data-rus` |

### Building from source

#### Dependencies

- [asdf](https://asdf-vm.com/) (version manager)
- That's it — asdf will manage Rust, Node.js, and pnpm

#### Build (Linux / Windows)

```bash
git clone https://github.com/Omibranch/qnote.git
cd qnote
pnpm install
pnpm tauri build
```

Binary will be at `src-tauri/target/release/qnote`.

#### Build (macOS)

```bash
git clone https://github.com/Omibranch/qnote.git
cd qnote
make mac-prepare   # install tools via asdf (requires asdf installed)
make mac-build     # build for macOS
```

Bundles will be at `src-tauri/target/release/bundle/macos/qnote.app` and `src-tauri/target/release/bundle/dmg/qnote_*.dmg`.

---

<a name="russian"></a>

## Русский

<!-- qnote_logo -->
<img src='https://i.ibb.co/YByQ9xr6/qnote-logo.jpg'>
qnote — лёгкий десктопный редактор текстовых заметок на базе Tauri v2 + React. Поддерживает Markdown с живым предпросмотром, историю файлов с поиском, настоящий PDF-экспорт, OCR, историю версий и безрамочное кастомное окно. Работает на Linux, Windows и macOS.

### Возможности

- Редактирование plain text и Markdown (`.md`) в одном приложении
- Live-предпросмотр Markdown с поддержкой GFM и HTML
- Панель форматирования: заголовки, жирный, курсив, код, цитаты, таблицы, ссылки, изображения
- Горячие клавиши работают на любой раскладке (русская, английская и др.)
- Сворачиваемый редактор в режиме Preview
- История файлов с группировкой по дням и быстрым поиском по названию и содержимому
- **История версий** — автоматические снимки при открытии и периодически; просмотр, восстановление, удаление любой версии
- **Экспорт в PDF** — настоящий PDF через [typst](https://typst.app) в цветах текущей темы (нужен `typst` в PATH)
- **Экспорт в HTML** — стилизованный автономный HTML-документ
- **OCR** — извлечение текста из изображений через [tesseract](https://github.com/tesseract-ocr/tesseract), результат вставляется прямо в заметку (нужен `tesseract` в PATH)
- CLI: `qnote ocr <файл>` — OCR из терминала, вывод в stdout
- Тёмная и светлая тема
- Автосохранение при редактировании уже сохранённых файлов
- Новые файлы сохраняются с расширением `.txt` по умолчанию
- Настраиваемый шрифт, размер и межстрочный интервал
- Кастомные контролы окна (на KDE, GNOME и других DE; всегда показываются на Windows и macOS)
- RTL-поддержка (арабский, иврит и другие)
- Без интернета, без сервера

| Dark-1 | Dark-2 | Lite-1 | Lite-2 |
| :---: | :---: | :---: | :---: |
| ![D1](https://i.ibb.co/SD9bzS9H/qnote-1dark.jpg) | ![D2](https://i.ibb.co/qF1W4FY9/qnote-2dark.jpg) | ![L1](https://i.ibb.co/pjhnRBVY/qnote-1lite.jpg) | ![L2](https://i.ibb.co/DPJmmrvy/qnote-2lite.jpg) |

### Установка

#### AUR (Arch Linux)

```bash
yay -S qnote
# или
paru -S qnote
```

#### Linux бинарник / AppImage / deb

Скачайте со страницы [Releases](https://github.com/Omibranch/qnote/releases):

| Пакет | Описание |
|-------|----------|
| `qnote-linux-x86_64` | Сырой бинарник, запускается напрямую |
| `qnote_*.AppImage` | Портативный, установка не нужна |
| `qnote_*.deb` | Пакет для Debian/Ubuntu |

> **Важно:** Бинарник и AppImage требуют системные библиотеки WebKit. На Ubuntu/Debian:
> ```bash
> sudo apt install libwebkit2gtk-4.1-0 libgtk-3-0
> ```

```bash
chmod +x qnote-linux-x86_64
./qnote-linux-x86_64
```

#### Windows

Скачайте со страницы [Releases](https://github.com/Omibranch/qnote/releases):

| Пакет | Описание |
|-------|----------|
| `qnote_*_x64-setup.exe` | NSIS-установщик, устанавливается в Program Files |
| `qnote-windows-portable.exe` | Портативный, установка не нужна |

WebView2 встроен в Windows 11 и устанавливается автоматически на Windows 10 при необходимости.

#### macOS

Скачайте со страницы [Releases](https://github.com/Omibranch/qnote/releases):

| Пакет | Описание |
|-------|----------|
| `qnote_*.dmg` | Дисковый образ, перетащите qnote.app в Applications |
| `qnote.app` | App-бандл, запускается напрямую |

#### Опциональные зависимости

| Функция | Зависимость |
|---------|-------------|
| Экспорт в PDF | [typst](https://typst.app) — `sudo pacman -S typst` / [typst releases](https://github.com/typst/typst/releases) |
| OCR | [tesseract](https://github.com/tesseract-ocr/tesseract) — `sudo pacman -S tesseract tesseract-data-eng tesseract-data-rus` |

### Сборка из исходников

#### Зависимости

- [asdf](https://asdf-vm.com/) (version manager)
- Всё остальное (Rust, Node.js, pnpm) установится через asdf

#### Сборка (Linux / Windows)

```bash
git clone https://github.com/Omibranch/qnote.git
cd qnote
pnpm install
pnpm tauri build
```

Бинарник появится в `src-tauri/target/release/qnote`.

#### Сборка (macOS)

```bash
git clone https://github.com/Omibranch/qnote.git
cd qnote
make mac-prepare   # установить инструменты через asdf (требуется asdf)
make mac-build     # сборка под macOS
```

Бандлы появятся в `src-tauri/target/release/bundle/macos/qnote.app` и `src-tauri/target/release/bundle/dmg/qnote_*.dmg`.

---

<div align="center">
MIT License · made by Omi
</div>

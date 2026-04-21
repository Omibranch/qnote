<!-- qnote_logo -->

<div align="center">

# qnote

[![License: MIT](https://img.shields.io/badge/License-MIT-8b7cf8?style=flat-square)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2.x-24c8db?style=flat-square&logo=tauri)](https://tauri.app)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Rust](https://img.shields.io/badge/Rust-stable-ce422b?style=flat-square&logo=rust)](https://www.rust-lang.org)
[![Platform](https://img.shields.io/badge/Platform-Linux-fcc624?style=flat-square&logo=linux&logoColor=333)](https://github.com/Omixxxxxxx/qnote/releases)

**Минималистичный редактор заметок. Markdown. Экспорт в PDF. Без лишнего.**

[English](#english) · [Русский](#russian)

</div>

---

<a name="russian"></a>

## Русский

<!-- qnote_logo -->

qnote — лёгкий десктопный редактор текстовых заметок на базе Tauri v2 + React. Поддерживает Markdown с живым предпросмотром, историю файлов с поиском, экспорт в PDF и кастомное оформление окна.

### Возможности

- Редактирование plain text и Markdown (`.md`) в одном приложении
- Live-предпросмотр Markdown с поддержкой GFM и HTML
- Панель форматирования: заголовки, жирный, курсив, код, цитаты, таблицы, ссылки, изображения
- Сворачиваемый редактор в режиме Preview
- История файлов с группировкой по дням и быстрым поиском по названию и содержимому
- Экспорт в PDF — генерация стилизованного HTML-документа в цветах текущей темы
- Тёмная и светлая тема
- Автосохранение при редактировании уже сохранённых файлов
- Настраиваемый шрифт, размер и межстрочный интервал
- Кастомные контролы окна (на KDE, GNOME и других DE)
- RTL-поддержка (арабский, иврит и другие)
- Работает без интернета, без сервера — один бинарник

### Установка

#### AUR (Arch Linux)

```bash
yay -S qnote
# или
paru -S qnote
```

#### Скачать бинарник

Скачайте актуальный бинарник со страницы [Releases](https://github.com/Omixxxxxxx/qnote/releases), дайте права на выполнение и запустите:

```bash
chmod +x qnote
./qnote
```

### Сборка из исходников

#### Зависимости

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) (`npm i -g pnpm`)
- Системные библиотеки GTK3 + WebKitGTK:

```bash
# Arch Linux
sudo pacman -S webkit2gtk-4.1 gtk3 base-devel

# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev build-essential
```

#### Сборка

```bash
git clone https://github.com/Omixxxxxxx/qnote.git
cd qnote
pnpm install
pnpm tauri build
```

Бинарник появится в `src-tauri/target/release/qnote`.

---

<a name="english"></a>

## English

<!-- qnote_logo -->

qnote is a lightweight desktop note editor built with Tauri v2 + React. It supports Markdown with live preview, file history with search, PDF export, and a custom-styled window.

### Features

- Plain text and Markdown (`.md`) editing in one app
- Live Markdown preview with GFM and HTML support
- Formatting toolbar: headings, bold, italic, code, blockquotes, tables, links, images
- Collapsible editor pane in Preview mode
- File history grouped by day with fast search by filename and content
- PDF export — generates a styled HTML document matching the current theme
- Dark and light themes
- Auto-save for already-saved files
- Configurable font, size, and line height
- Custom window controls (on KDE, GNOME, and other DEs)
- RTL support (Arabic, Hebrew, etc.)
- No internet required, no server — single binary

### Installation

#### AUR (Arch Linux)

```bash
yay -S qnote
# or
paru -S qnote
```

#### Download binary

Download the latest binary from the [Releases](https://github.com/Omixxxxxxx/qnote/releases) page, make it executable, and run:

```bash
chmod +x qnote
./qnote
```

### Building from source

#### Dependencies

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) (`npm i -g pnpm`)
- GTK3 + WebKitGTK system libraries:

```bash
# Arch Linux
sudo pacman -S webkit2gtk-4.1 gtk3 base-devel

# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev build-essential
```

#### Build

```bash
git clone https://github.com/Omixxxxxxx/qnote.git
cd qnote
pnpm install
pnpm tauri build
```

Binary will be at `src-tauri/target/release/qnote`.

---

<div align="center">
MIT License · made by Omi
</div>

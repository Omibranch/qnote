<!-- qnote_logo -->
<img src='https://i.ibb.co/YByQ9xr6/qnote-logo.jpg'>
<div align="center">

# qnote

[![License: MIT](https://img.shields.io/badge/License-MIT-8b7cf8?style=flat-square)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2.x-24c8db?style=flat-square&logo=tauri)](https://tauri.app)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Rust](https://img.shields.io/badge/Rust-stable-ce422b?style=flat-square&logo=rust)](https://www.rust-lang.org)
[![Platform](https://img.shields.io/badge/Platform-Linux%20%7C%20Windows-fcc624?style=flat-square&logo=linux&logoColor=333)](https://github.com/Omixxxxxxx/qnote/releases)

**Minimalistic pretty file redactor.**

[English](#english) · [Русский](#russian)

</div>

---

<a name="english"></a>

## English

<!-- qnote_logo -->

qnote is a lightweight desktop note editor built with Tauri v2 + React. It supports Markdown with live preview, file history with search, PDF export, and a custom-styled window. Works on Linux and Windows.

### Features

- Plain text and Markdown (`.md`) editing in one app
- Live Markdown preview with GFM and HTML support
- Formatting toolbar: headings, bold, italic, code, blockquotes, tables, links, images
- Keyboard shortcuts work regardless of active keyboard layout
- Collapsible editor pane in Preview mode
- File history grouped by day with fast search by filename and content
- PDF export — generates a styled HTML document matching the current theme
- Dark and light themes
- Auto-save for already-saved files
- New files default to `.txt` extension
- Configurable font, size, and line height
- Custom window controls (on KDE, GNOME, and other DEs)
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

#### Linux binary

Download the latest binary from the [Releases](https://github.com/Omixxxxxxx/qnote/releases) page.

> **Note:** The binary requires system libraries that are usually pre-installed on Arch Linux. On Ubuntu/Debian you may need to install them:
> ```bash
> sudo apt install libwebkit2gtk-4.1-0 libgtk-3-0
> ```

```bash
chmod +x qnote-linux-x86_64
./qnote-linux-x86_64
```

#### Windows

Download `qnote-windows-setup.exe` from the [Releases](https://github.com/Omixxxxxxx/qnote/releases) page and run the installer. WebView2 is included with Windows 11 and is installed automatically on Windows 10 if missing.

### Building from source

#### Dependencies

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) (`npm i -g pnpm`)
- GTK3 + WebKitGTK system libraries (Linux only):

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

<a name="russian"></a>

## Русский

<!-- qnote_logo -->
<img src='https://i.ibb.co/YByQ9xr6/qnote-logo.jpg'>
qnote — лёгкий десктопный редактор текстовых заметок на базе Tauri v2 + React. Поддерживает Markdown с живым предпросмотром, историю файлов с поиском, экспорт в PDF и кастомное оформление окна. Работает на Linux и Windows.

### Возможности

- Редактирование plain text и Markdown (`.md`) в одном приложении
- Live-предпросмотр Markdown с поддержкой GFM и HTML
- Панель форматирования: заголовки, жирный, курсив, код, цитаты, таблицы, ссылки, изображения
- Горячие клавиши работают на любой раскладке (русская, английская и др.)
- Сворачиваемый редактор в режиме Preview
- История файлов с группировкой по дням и быстрым поиском по названию и содержимому
- Экспорт в PDF — генерация стилизованного HTML-документа в цветах текущей темы
- Тёмная и светлая тема
- Автосохранение при редактировании уже сохранённых файлов
- Новые файлы сохраняются с расширением `.txt` по умолчанию
- Настраиваемый шрифт, размер и межстрочный интервал
- Кастомные контролы окна (на KDE, GNOME и других DE)
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

#### Linux бинарник

Скачайте актуальный бинарник со страницы [Releases](https://github.com/Omixxxxxxx/qnote/releases).

> **Важно:** Бинарник требует системные библиотеки, которые обычно предустановлены на Arch Linux. На Ubuntu/Debian может понадобиться установить их:
> ```bash
> sudo apt install libwebkit2gtk-4.1-0 libgtk-3-0
> ```

```bash
chmod +x qnote-linux-x86_64
./qnote-linux-x86_64
```

#### Windows

Скачайте `qnote-windows-setup.exe` со страницы [Releases](https://github.com/Omixxxxxxx/qnote/releases) и запустите установщик. WebView2 встроен в Windows 11 и устанавливается автоматически на Windows 10 при необходимости.

### Сборка из исходников

#### Зависимости

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) (`npm i -g pnpm`)
- Системные библиотеки GTK3 + WebKitGTK (только Linux):

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

<div align="center">
MIT License · made by Omi
</div>

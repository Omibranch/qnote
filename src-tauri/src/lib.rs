use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};
use sha1::{Digest, Sha1};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub path: String,
    pub title: String,
    pub last_opened: i64,
}

fn default_version_interval() -> u32 { 10 }
fn default_debug_mode() -> bool { false }
fn default_show_grid() -> bool { false }
fn default_accent_dark() -> String { "#8a9a8c".to_string() }
fn default_accent_light() -> String { "#3c4d3e".to_string() }
fn default_bg_dark() -> String { "#111213".to_string() }
fn default_bg_light() -> String { "#f5f5f0".to_string() }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub retention_days: u32,
    pub font_family: String,
    pub font_size: u32,
    pub theme: String,
    pub line_height: f32,
    #[serde(default = "default_version_interval")]
    pub version_interval_minutes: u32,
    #[serde(default = "default_debug_mode")]
    pub debug_mode: bool,
    #[serde(default = "default_accent_dark")]
    pub accent_dark: String,
    #[serde(default = "default_accent_light")]
    pub accent_light: String,
    #[serde(default = "default_bg_dark")]
    pub bg_dark: String,
    #[serde(default = "default_bg_light")]
    pub bg_light: String,
    #[serde(default = "default_show_grid")]
    pub show_grid: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Settings {
            retention_days: 7,
            font_family: "JetBrains Mono".to_string(),
            font_size: 15,
            theme: "dark".to_string(),
            line_height: 1.7,
            version_interval_minutes: 10,
            debug_mode: false,
            accent_dark: "#8a9a8c".to_string(),
            accent_light: "#3c4d3e".to_string(),
            bg_dark: "#111213".to_string(),
            bg_light: "#f5f5f0".to_string(),
            show_grid: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionEntry {
    pub timestamp_ms: i64,
    pub size: u64,
    pub preview: String,
}

fn data_dir() -> PathBuf {
    dirs::data_local_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("qnote")
}

fn ensure_data_dir() -> Result<(), String> {
    fs::create_dir_all(data_dir()).map_err(|e| e.to_string())
}

fn load_settings() -> Settings {
    let path = data_dir().join("settings.json");
    if !path.exists() {
        return Settings::default();
    }
    let data = fs::read_to_string(&path).unwrap_or_default();
    serde_json::from_str(&data).unwrap_or_default()
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = std::path::Path::new(&path).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_history() -> Result<Vec<HistoryEntry>, String> {
    let settings = load_settings();
    let cutoff_ts = (Utc::now() - Duration::days(settings.retention_days as i64)).timestamp();

    let path = data_dir().join("history.json");
    if !path.exists() {
        return Ok(vec![]);
    }

    let data = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let mut history: Vec<HistoryEntry> = serde_json::from_str(&data).unwrap_or_default();

    history.retain(|e| {
        e.last_opened >= cutoff_ts && std::path::Path::new(&e.path).exists()
    });

    history.sort_by(|a, b| b.last_opened.cmp(&a.last_opened));

    let _ = persist_history(&history);
    Ok(history)
}

#[tauri::command]
fn add_to_history(path: String, title: String) -> Result<(), String> {
    ensure_data_dir()?;
    let history_file = data_dir().join("history.json");

    let mut history: Vec<HistoryEntry> = if history_file.exists() {
        let data = fs::read_to_string(&history_file).unwrap_or_default();
        serde_json::from_str(&data).unwrap_or_default()
    } else {
        vec![]
    };

    history.retain(|e| e.path != path);
    history.insert(
        0,
        HistoryEntry {
            path,
            title,
            last_opened: Utc::now().timestamp(),
        },
    );
    history.truncate(100);

    persist_history(&history)
}

fn persist_history(history: &[HistoryEntry]) -> Result<(), String> {
    ensure_data_dir()?;
    let json = serde_json::to_string_pretty(history).map_err(|e| e.to_string())?;
    fs::write(data_dir().join("history.json"), json).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_settings() -> Settings {
    load_settings()
}

#[tauri::command]
fn save_settings(settings: Settings) -> Result<(), String> {
    ensure_data_dir()?;
    let json = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    fs::write(data_dir().join("settings.json"), json).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_desktop_env() -> String {
    std::env::var("XDG_CURRENT_DESKTOP").unwrap_or_default()
}

#[tauri::command]
fn get_platform() -> String {
    std::env::consts::OS.to_string()
}

#[tauri::command]
fn search_files(query: String) -> Result<Vec<HistoryEntry>, String> {
    let history = get_history()?;
    if query.trim().is_empty() {
        return Ok(history);
    }
    let q = query.to_lowercase();
    let mut results = vec![];
    for entry in history {
        if entry.title.to_lowercase().contains(&q) {
            results.push(entry);
            continue;
        }
        if let Ok(content) = fs::read_to_string(&entry.path) {
            if content.to_lowercase().contains(&q) {
                results.push(entry);
            }
        }
    }
    Ok(results)
}

#[tauri::command]
fn get_system_fonts() -> Vec<String> {
    if cfg!(target_os = "macos") {
        return get_system_fonts_macos();
    }

    let output = Command::new("fc-list")
        .arg("--format=%{family}\n")
        .output();

    match output {
        Ok(out) => {
            let text = String::from_utf8_lossy(&out.stdout);
            let mut fonts: Vec<String> = text
                .lines()
                .flat_map(|line| line.split(','))
                .map(|f| f.trim().to_string())
                .filter(|f| !f.is_empty())
                .collect();
            fonts.sort();
            fonts.dedup();
            fonts
        }
        Err(_) => fallback_fonts(),
    }
}

fn get_system_fonts_macos() -> Vec<String> {
    let output = Command::new("system_profiler")
        .arg("SPFontsDataType")
        .output();

    match output {
        Ok(out) => {
            let text = String::from_utf8_lossy(&out.stdout);
            let mut fonts = Vec::new();
            for line in text.lines() {
                let trimmed = line.trim();
                if let Some(family) = trimmed.strip_prefix("Family: ") {
                    let name = family.trim().to_string();
                    if !name.is_empty() {
                        fonts.push(name);
                    }
                }
            }
            fonts.sort();
            fonts.dedup();
            if fonts.is_empty() {
                fallback_fonts()
            } else {
                fonts
            }
        }
        Err(_) => fallback_fonts(),
    }
}

fn fallback_fonts() -> Vec<String> {
    vec![
        "JetBrains Mono".to_string(),
        "Fira Code".to_string(),
        "Inter".to_string(),
        "Roboto Mono".to_string(),
        "Ubuntu Mono".to_string(),
    ]
}

// ---------- PDF export (via typst CLI) ----------

fn escape_typst_content(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            '\\' | '*' | '_' | '`' | '#' | '$' | '<' | '>' | '[' | ']' | '@' | '=' | '~' => {
                out.push('\\');
                out.push(c);
            }
            _ => out.push(c),
        }
    }
    out
}

fn escape_typst_string(s: &str) -> String {
    s.replace('\\', "\\\\").replace('"', "\\\"")
}

fn md_to_typst(md: &str) -> String {
    use pulldown_cmark::{Event, Tag, TagEnd, Parser, Options, HeadingLevel, CodeBlockKind};

    let opts = Options::ENABLE_STRIKETHROUGH
        | Options::ENABLE_TABLES
        | Options::ENABLE_TASKLISTS;
    let parser = Parser::new_ext(md, opts);
    let mut out = String::new();

    let mut list_stack: Vec<bool> = vec![]; // true = ordered
    let mut in_code_block = false;
    let mut code_lang = String::new();
    let mut code_buf = String::new();
    let mut in_image = false;

    let mut in_table = false;
    let mut table_cols = 0usize;
    let mut table_cells: Vec<String> = vec![];
    let mut in_cell = false;
    let mut cell_buf = String::new();
    let mut in_head_row = false;

    for event in parser {
        match event {
            Event::Start(Tag::Paragraph) => {}
            Event::End(TagEnd::Paragraph) => {
                out.push_str("\n\n");
            }
            Event::Start(Tag::Heading { level, .. }) => {
                let n = match level {
                    HeadingLevel::H1 => 1,
                    HeadingLevel::H2 => 2,
                    HeadingLevel::H3 => 3,
                    HeadingLevel::H4 => 4,
                    HeadingLevel::H5 => 5,
                    HeadingLevel::H6 => 6,
                };
                out.push_str(&"=".repeat(n));
                out.push(' ');
            }
            Event::End(TagEnd::Heading(_)) => {
                out.push_str("\n\n");
            }
            Event::Start(Tag::Emphasis) => {
                if in_cell { cell_buf.push('_'); } else { out.push('_'); }
            }
            Event::End(TagEnd::Emphasis) => {
                if in_cell { cell_buf.push('_'); } else { out.push('_'); }
            }
            Event::Start(Tag::Strong) => {
                if in_cell { cell_buf.push('*'); } else { out.push('*'); }
            }
            Event::End(TagEnd::Strong) => {
                if in_cell { cell_buf.push('*'); } else { out.push('*'); }
            }
            Event::Start(Tag::Strikethrough) => {
                let piece = "#strike[";
                if in_cell { cell_buf.push_str(piece); } else { out.push_str(piece); }
            }
            Event::End(TagEnd::Strikethrough) => {
                if in_cell { cell_buf.push(']'); } else { out.push(']'); }
            }
            Event::Start(Tag::Link { dest_url, .. }) => {
                let piece = format!("#link(\"{}\")[", escape_typst_string(&dest_url));
                if in_cell { cell_buf.push_str(&piece); } else { out.push_str(&piece); }
            }
            Event::End(TagEnd::Link) => {
                if in_cell { cell_buf.push(']'); } else { out.push(']'); }
            }
            Event::Start(Tag::Image { dest_url, .. }) => {
                in_image = true;
                let url = dest_url.as_ref();
                let expanded = if url.starts_with("~/") {
                    dirs::home_dir()
                        .map(|h| h.join(&url[2..]).to_string_lossy().into_owned())
                        .unwrap_or_else(|| url.to_string())
                } else {
                    url.to_string()
                };
                let piece = format!("\n#image(\"{}\")\n", escape_typst_string(&expanded));
                if in_cell { cell_buf.push_str(&piece); } else { out.push_str(&piece); }
            }
            Event::End(TagEnd::Image) => {
                in_image = false;
            }
            Event::Start(Tag::List(n)) => {
                list_stack.push(n.is_some());
            }
            Event::End(TagEnd::List(_)) => {
                list_stack.pop();
                out.push('\n');
            }
            Event::Start(Tag::Item) => {
                for _ in 0..list_stack.len().saturating_sub(1) {
                    out.push_str("  ");
                }
                match list_stack.last() {
                    Some(true) => out.push_str("+ "),
                    _ => out.push_str("- "),
                }
            }
            Event::End(TagEnd::Item) => {
                out.push('\n');
            }
            Event::Start(Tag::CodeBlock(kind)) => {
                in_code_block = true;
                code_lang = match kind {
                    CodeBlockKind::Fenced(lang) => lang.to_string(),
                    _ => String::new(),
                };
                code_buf.clear();
            }
            Event::End(TagEnd::CodeBlock) => {
                in_code_block = false;
                out.push_str("\n```");
                out.push_str(&code_lang);
                out.push('\n');
                out.push_str(&code_buf);
                if !code_buf.ends_with('\n') {
                    out.push('\n');
                }
                out.push_str("```\n\n");
            }
            Event::Start(Tag::BlockQuote(_)) => {
                out.push_str("#quote(block: true)[");
            }
            Event::End(TagEnd::BlockQuote(_)) => {
                out.push_str("]\n\n");
            }
            Event::Start(Tag::Table(aligns)) => {
                in_table = true;
                table_cols = aligns.len().max(1);
                table_cells.clear();
            }
            Event::End(TagEnd::Table) => {
                in_table = false;
                if !table_cells.is_empty() {
                    out.push_str(&format!(
                        "#table(columns: {}, stroke: 0.5pt,\n",
                        table_cols
                    ));
                    for cell in &table_cells {
                        out.push_str("  [");
                        out.push_str(cell);
                        out.push_str("],\n");
                    }
                    out.push_str(")\n\n");
                }
            }
            Event::Start(Tag::TableHead) => {
                in_head_row = true;
            }
            Event::End(TagEnd::TableHead) => {
                in_head_row = false;
            }
            Event::Start(Tag::TableRow) => {}
            Event::End(TagEnd::TableRow) => {}
            Event::Start(Tag::TableCell) => {
                in_cell = true;
                cell_buf.clear();
                if in_head_row {
                    cell_buf.push('*');
                }
            }
            Event::End(TagEnd::TableCell) => {
                if in_head_row {
                    cell_buf.push('*');
                }
                table_cells.push(cell_buf.clone());
                in_cell = false;
            }
            Event::Text(text) => {
                if in_code_block {
                    code_buf.push_str(&text);
                } else if in_image {
                    // alt text — skip, image is already rendered via #image()
                } else if in_cell {
                    cell_buf.push_str(&escape_typst_content(&text));
                } else {
                    out.push_str(&escape_typst_content(&text));
                }
            }
            Event::Code(text) => {
                let body = text.replace('`', "\\`");
                let piece = format!("`{}`", body);
                if in_cell { cell_buf.push_str(&piece); } else if in_table {
                    // ignore stray code outside cell
                } else { out.push_str(&piece); }
            }
            Event::Html(html) | Event::InlineHtml(html) => {
                let piece = escape_typst_content(&html);
                if in_cell { cell_buf.push_str(&piece); } else { out.push_str(&piece); }
            }
            Event::HardBreak => {
                if in_cell { cell_buf.push_str(" \\ "); } else { out.push_str(" \\ "); }
            }
            Event::SoftBreak => {
                if in_cell { cell_buf.push(' '); } else { out.push(' '); }
            }
            Event::Rule => {
                out.push_str("\n#line(length: 100%, stroke: 0.5pt)\n\n");
            }
            Event::TaskListMarker(checked) => {
                let m = if checked { "☑ " } else { "☐ " };
                if in_cell { cell_buf.push_str(m); } else { out.push_str(m); }
            }
            Event::FootnoteReference(_) => {}
            Event::InlineMath(m) | Event::DisplayMath(m) => {
                let piece = format!("`{}`", m.replace('`', "\\`"));
                if in_cell { cell_buf.push_str(&piece); } else { out.push_str(&piece); }
            }
            Event::Start(Tag::HtmlBlock) | Event::End(TagEnd::HtmlBlock) => {}
            Event::Start(Tag::FootnoteDefinition(_)) | Event::End(TagEnd::FootnoteDefinition) => {}
            Event::Start(Tag::MetadataBlock(_)) | Event::End(TagEnd::MetadataBlock(_)) => {}
            Event::Start(Tag::DefinitionList) | Event::End(TagEnd::DefinitionList) => {}
            Event::Start(Tag::DefinitionListTitle) | Event::End(TagEnd::DefinitionListTitle) => {}
            Event::Start(Tag::DefinitionListDefinition) | Event::End(TagEnd::DefinitionListDefinition) => {}
        }
    }
    out
}

fn build_typst_source(
    content: &str,
    is_markdown: bool,
    title: &str,
    theme: &str,
    font_family: &str,
    font_size: u32,
    line_height: f32,
) -> String {
    let dark = theme == "dark";
    let bg = if dark { "#0e0e10" } else { "#ffffff" };
    let fg = if dark { "#e8e8ec" } else { "#111115" };
    let accent = if dark { "#8b7cf8" } else { "#6c5ce7" };
    let code_bg = if dark { "#1e1e22" } else { "#f0f0f4" };
    let code_border = if dark { "rgb(\"#2a2a30\")" } else { "rgb(\"#e0e0e8\")" };
    let muted = if dark { "#9090a0" } else { "#6b6b80" };

    let body = if is_markdown {
        md_to_typst(content)
    } else {
        let lang = String::new();
        let mut s = String::new();
        s.push_str("```");
        s.push_str(&lang);
        s.push('\n');
        s.push_str(content);
        if !content.ends_with('\n') {
            s.push('\n');
        }
        s.push_str("```\n");
        s
    };

    format!(
        r#"#set page(
  paper: "a4",
  margin: (x: 2.2cm, y: 2.4cm),
  fill: rgb("{bg}"),
)
#set text(
  font: ("{font}", "Noto Sans", "DejaVu Sans", "Liberation Sans"),
  size: {size}pt,
  fill: rgb("{fg}"),
)
#set par(leading: {leading}em, justify: false)
#show heading: set text(fill: rgb("{fg}"), weight: "semibold")
#show heading.where(level: 1): it => [
  #set text(size: 1.8em)
  #block(below: 0.4em)[#it.body]
  #line(length: 100%, stroke: 0.5pt + rgb("{muted}"))
  #v(0.4em)
]
#show heading.where(level: 2): it => [
  #set text(size: 1.4em)
  #block(below: 0.3em)[#it.body]
  #line(length: 100%, stroke: 0.3pt + rgb("{muted}"))
  #v(0.3em)
]
#show link: set text(fill: rgb("{accent}"))
#show raw.where(block: false): box.with(
  fill: rgb("{code_bg}"),
  inset: (x: 3pt, y: 1pt),
  outset: (y: 2pt),
  radius: 2pt,
)
#show raw.where(block: true): it => block(
  fill: rgb("{code_bg}"),
  stroke: 0.5pt + {code_border},
  radius: 6pt,
  inset: 12pt,
  width: 100%,
)[#it]
#show quote: it => block(
  fill: rgb("{code_bg}"),
  stroke: (left: 3pt + rgb("{accent}")),
  inset: (x: 14pt, y: 10pt),
  radius: (right: 6pt),
  width: 100%,
)[
  #set text(fill: rgb("{muted}"))
  #it.body
]

#block()[= {title}]
#v(0.6em)

{body}
"#,
        bg = bg,
        fg = fg,
        muted = muted,
        accent = accent,
        code_bg = code_bg,
        code_border = code_border,
        font = font_family.replace('"', "\\\""),
        size = font_size.clamp(8, 24),
        leading = ((line_height - 1.0).max(0.2) / 2.0),
        title = escape_typst_content(title),
        body = body,
    )
}

#[tauri::command]
fn export_pdf(
    save_path: String,
    content: String,
    is_markdown: bool,
    title: String,
    settings: Settings,
) -> Result<(), String> {
    let typst_src = build_typst_source(
        &content,
        is_markdown,
        &title,
        &settings.theme,
        &settings.font_family,
        settings.font_size,
        settings.line_height,
    );

    let tmp_dir = std::env::temp_dir();
    let stamp = Utc::now().timestamp_millis();
    let typ_path = tmp_dir.join(format!("qnote-{}.typ", stamp));
    fs::write(&typ_path, &typst_src).map_err(|e| format!("write typst source: {e}"))?;

    if let Some(parent) = Path::new(&save_path).parent() {
        let _ = fs::create_dir_all(parent);
    }

    let output = Command::new("typst")
        .arg("compile")
        .arg(&typ_path)
        .arg(&save_path)
        .output();

    let _ = fs::remove_file(&typ_path);

    match output {
        Ok(out) if out.status.success() => Ok(()),
        Ok(out) => {
            let stderr = String::from_utf8_lossy(&out.stderr).to_string();
            Err(format!("typst failed: {}", stderr.trim()))
        }
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Err(
            "typst not installed. Install it: Arch: sudo pacman -S typst, macOS: brew install typst, Windows: scoop install typst (or winget install typst)."
                .to_string(),
        ),
        Err(e) => Err(format!("failed to run typst: {e}")),
    }
}

// ---------- OCR ----------

fn tesseract_run(image_path: &str, lang: &str) -> std::io::Result<std::process::Output> {
    Command::new("tesseract")
        .arg(image_path)
        .arg("-")
        .arg("-l").arg(lang)
        .arg("--oem").arg("1")   // LSTM only — better accuracy
        .arg("--psm").arg("6")   // uniform block of text
        .output()
}

fn run_ocr(image_path: &str) -> Result<String, String> {
    let output = tesseract_run(image_path, "rus+eng");

    match output {
        Ok(out) if out.status.success() => {
            Ok(String::from_utf8_lossy(&out.stdout).trim_end().to_string())
        }
        Ok(out) => {
            let stderr = String::from_utf8_lossy(&out.stderr).to_string();
            // If rus lang data missing, retry with eng only
            if stderr.contains("Failed loading language") || stderr.contains("TESSDATA") {
                let out2 = tesseract_run(image_path, "eng")
                    .map_err(|e| format!("tesseract error: {e}"))?;
                if out2.status.success() {
                    return Ok(String::from_utf8_lossy(&out2.stdout).trim_end().to_string());
                }
                return Err(format!(
                    "tesseract failed: {}",
                    String::from_utf8_lossy(&out2.stderr).trim()
                ));
            }
            Err(format!("tesseract failed: {}", stderr.trim()))
        }
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Err(
            "tesseract not installed. Install it: Arch: sudo pacman -S tesseract tesseract-data-eng tesseract-data-rus, macOS: brew install tesseract, Windows: see https://github.com/UB-Mannheim/tesseract/wiki."
                .to_string(),
        ),
        Err(e) => Err(format!("failed to run tesseract: {e}")),
    }
}

#[tauri::command]
fn ocr_image(path: String) -> Result<String, String> {
    run_ocr(&path)
}

// ---------- Version history ----------

fn sha1_hex(s: &str) -> String {
    let mut h = Sha1::new();
    h.update(s.as_bytes());
    let out = h.finalize();
    out.iter().map(|b| format!("{:02x}", b)).collect()
}

fn versions_dir_for(file_path: &str) -> PathBuf {
    data_dir().join("versions").join(sha1_hex(file_path))
}

fn make_preview(content: &str) -> String {
    let trimmed = content.trim_start();
    let head: String = trimmed.chars().take(120).collect();
    head.replace('\n', " ").replace('\r', " ")
}

#[tauri::command]
fn save_version(file_path: String, content: String) -> Result<Option<VersionEntry>, String> {
    let dir = versions_dir_for(&file_path);
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;

    // Dedup against most-recent version: skip if identical.
    let mut entries = read_version_dir(&dir)?;
    entries.sort_by_key(|e| std::cmp::Reverse(e.timestamp_ms));
    if let Some(latest) = entries.first() {
        let latest_path = dir.join(format!("{}.snap", latest.timestamp_ms));
        if let Ok(prev) = fs::read_to_string(&latest_path) {
            if prev == content {
                return Ok(None);
            }
        }
    }

    let ts = Utc::now().timestamp_millis();
    let snap_path = dir.join(format!("{}.snap", ts));
    fs::write(&snap_path, &content).map_err(|e| e.to_string())?;

    // Cap to 200 snapshots per file.
    entries.insert(0, VersionEntry {
        timestamp_ms: ts,
        size: content.len() as u64,
        preview: make_preview(&content),
    });
    if entries.len() > 200 {
        for old in &entries[200..] {
            let _ = fs::remove_file(dir.join(format!("{}.snap", old.timestamp_ms)));
        }
    }

    Ok(Some(VersionEntry {
        timestamp_ms: ts,
        size: content.len() as u64,
        preview: make_preview(&content),
    }))
}

fn read_version_dir(dir: &Path) -> Result<Vec<VersionEntry>, String> {
    if !dir.exists() {
        return Ok(vec![]);
    }
    let mut out = vec![];
    for entry in fs::read_dir(dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let p = entry.path();
        if p.extension().and_then(|s| s.to_str()) != Some("snap") {
            continue;
        }
        let stem = match p.file_stem().and_then(|s| s.to_str()) {
            Some(s) => s,
            None => continue,
        };
        let ts: i64 = match stem.parse() {
            Ok(v) => v,
            Err(_) => continue,
        };
        let meta = entry.metadata().map_err(|e| e.to_string())?;
        let preview = fs::read_to_string(&p)
            .map(|s| make_preview(&s))
            .unwrap_or_default();
        out.push(VersionEntry {
            timestamp_ms: ts,
            size: meta.len(),
            preview,
        });
    }
    out.sort_by_key(|e| std::cmp::Reverse(e.timestamp_ms));
    Ok(out)
}

#[tauri::command]
fn list_versions(file_path: String) -> Result<Vec<VersionEntry>, String> {
    read_version_dir(&versions_dir_for(&file_path))
}

#[tauri::command]
fn read_version(file_path: String, timestamp_ms: i64) -> Result<String, String> {
    let p = versions_dir_for(&file_path).join(format!("{}.snap", timestamp_ms));
    fs::read_to_string(&p).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_version(file_path: String, timestamp_ms: i64) -> Result<(), String> {
    let p = versions_dir_for(&file_path).join(format!("{}.snap", timestamp_ms));
    if p.exists() {
        fs::remove_file(&p).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn exit_app(app: tauri::AppHandle) {
    app.exit(0);
}

// Handle `qnote ocr <path>` before Tauri starts.
pub fn handle_cli() -> bool {
    let args: Vec<String> = std::env::args().collect();
    if args.len() >= 3 && args[1] == "ocr" {
        let path = &args[2];
        match run_ocr(path) {
            Ok(text) => {
                println!("{}", text);
                std::process::exit(0);
            }
            Err(e) => {
                eprintln!("qnote ocr: {}", e);
                std::process::exit(1);
            }
        }
    }
    if args.len() >= 2 && (args[1] == "--help" || args[1] == "-h" || args[1] == "help") {
        println!("qnote — minimal notepad");
        println!();
        println!("Usage:");
        println!("  qnote                  launch GUI");
        println!("  qnote ocr <image>      extract text from an image and print to stdout");
        println!("  qnote --version        print version");
        std::process::exit(0);
    }
    if args.len() >= 2 && (args[1] == "--version" || args[1] == "-V") {
        println!("qnote {}", env!("CARGO_PKG_VERSION"));
        std::process::exit(0);
    }
    false
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // WebKitGTK respects system proxy env vars and will route localhost through them.
    // Ensure localhost is always excluded so the dev server loads without a proxy.
    let no_proxy = std::env::var("no_proxy").unwrap_or_default();
    if !no_proxy.contains("localhost") {
        let updated = if no_proxy.is_empty() {
            "localhost,127.0.0.1".to_string()
        } else {
            format!("localhost,127.0.0.1,{}", no_proxy)
        };
        std::env::set_var("no_proxy", &updated);
        std::env::set_var("NO_PROXY", &updated);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            get_history,
            add_to_history,
            get_settings,
            save_settings,
            get_system_fonts,
            get_desktop_env,
            get_platform,
            search_files,
            export_pdf,
            ocr_image,
            save_version,
            list_versions,
            read_version,
            delete_version,
            exit_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use std::fs;
use std::path::PathBuf;
use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub path: String,
    pub title: String,
    pub last_opened: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub retention_days: u32,
    pub font_family: String,
    pub font_size: u32,
    pub theme: String,
    pub line_height: f32,
}

impl Default for Settings {
    fn default() -> Self {
        Settings {
            retention_days: 7,
            font_family: "JetBrains Mono".to_string(),
            font_size: 15,
            theme: "dark".to_string(),
            line_height: 1.7,
        }
    }
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
    let output = std::process::Command::new("fc-list")
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
        Err(_) => vec![
            "JetBrains Mono".to_string(),
            "Fira Code".to_string(),
            "Inter".to_string(),
            "Roboto Mono".to_string(),
            "Ubuntu Mono".to_string(),
        ],
    }
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
            search_files,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

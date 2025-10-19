// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use tauri::State;

// 全局状态：计数器
struct Counter(Mutex<i32>);

// 问候命令
#[tauri::command]
fn greet(name: &str) -> String {
    format!("你好, {}! 欢迎使用 Tauri 2.0!", name)
}

// 增加计数器
#[tauri::command]
fn increment_counter(counter: State<Counter>) -> i32 {
    let mut count = counter.0.lock().unwrap();
    *count += 1;
    *count
}

// 获取当前计数
#[tauri::command]
fn get_counter(counter: State<Counter>) -> i32 {
    let count = counter.0.lock().unwrap();
    *count
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(Counter(Mutex::new(0)))
        .invoke_handler(tauri::generate_handler![
            greet,
            increment_counter,
            get_counter
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


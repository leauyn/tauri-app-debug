#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use tauri::{Manager, State};
use tauri_plugin_shell::ShellExt;

struct Counter(Mutex<i32>);
struct SidecarState(Mutex<Option<tauri_plugin_shell::process::CommandChild>>);

#[tauri::command]
fn greet(name: &str) -> String {
    format!("你好, {}! 欢迎使用 Tauri 2.0!", name)
}

#[tauri::command]
fn increment_counter(counter: State<Counter>) -> i32 {
    let mut count = counter.0.lock().unwrap();
    *count += 1;
    *count
}

#[tauri::command]
fn get_counter(counter: State<Counter>) -> i32 {
    let count = counter.0.lock().unwrap();
    *count
}

// 启动 Next.js sidecar 服务
#[tauri::command]
async fn start_nextjs_server(
    app: tauri::AppHandle,
    sidecar_state: State<'_, SidecarState>,
) -> Result<String, String> {
    // 检查是否已经运行
    {
        let state = sidecar_state.0.lock().unwrap();
        if state.is_some() {
            return Ok("Next.js server is already running".to_string());
        }
    } // MutexGuard 在这里被释放

    // 启动 sidecar
    let (_rx, child) = app
        .shell()
        .sidecar("node")
        .map_err(|e| format!("Failed to create sidecar command: {}", e))?
        .args(["binaries/nextjs-server/server.js"])
        .spawn()
        .map_err(|e| format!("Failed to spawn sidecar: {}", e))?;

    // 保存 child
    {
        let mut state = sidecar_state.0.lock().unwrap();
        *state = Some(child);
    } // MutexGuard 在这里被释放

    // 等待服务启动 - 现在锁已经释放了
    tokio::time::sleep(tokio::time::Duration::from_secs(3)).await;

    Ok("Next.js server started on http://localhost:3001".to_string())
}

// 停止 Next.js sidecar 服务
#[tauri::command]
async fn stop_nextjs_server(sidecar_state: State<'_, SidecarState>) -> Result<String, String> {
    let mut state = sidecar_state.0.lock().unwrap();

    if let Some(child) = state.take() {
        // 注意：child 需要是 mut 才能调用 kill()
        drop(state); // 先释放锁

        child
            .kill()
            .map_err(|e| format!("Failed to kill sidecar: {}", e))?;
        Ok("Next.js server stopped".to_string())
    } else {
        Err("Next.js server is not running".to_string())
    }
}

// 调用 Next.js API
#[tauri::command]
async fn call_nextjs_api(endpoint: String) -> Result<String, String> {
    let url = format!("http://localhost:3001{}", endpoint);

    let response = reqwest::get(&url)
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let body = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    Ok(body)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(Counter(Mutex::new(0)))
        .manage(SidecarState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            greet,
            increment_counter,
            get_counter,
            start_nextjs_server,
            stop_nextjs_server,
            call_nextjs_api,
        ])
        .setup(|app| {
            // 应用启动时自动启动 Next.js 服务
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;

                let sidecar_state = app_handle.state::<SidecarState>();

                // 检查是否已经运行
                let is_running = {
                    let state = sidecar_state.0.lock().unwrap();
                    state.is_some()
                };

                if !is_running {
                    // 启动 Next.js 服务
                    if let Ok((_rx, child)) = app_handle
                        .shell()
                        .sidecar("node")
                        .and_then(|cmd| cmd.args(["binaries/nextjs-server/server.js"]).spawn())
                    {
                        let mut state = sidecar_state.0.lock().unwrap();
                        *state = Some(child);
                        println!("✅ Next.js server started automatically");
                    } else {
                        eprintln!("❌ Failed to start Next.js server automatically");
                    }
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


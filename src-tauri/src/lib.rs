use tauri::{Manager, WebviewWindowBuilder, WebviewUrl};
use std::sync::Arc;
use std::env;
use tokio::sync::Mutex;
use warp::Filter;
use dotenv::dotenv;

#[tauri::command]
async fn open_chat_window(app_handle: tauri::AppHandle) -> Result<(), String> {
  create_chat_window(&app_handle).await;
  Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  dotenv().ok();
  
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![open_chat_window])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      
      let app_handle = app.handle().clone();
      std::thread::spawn(move || {
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(async {
          start_http_server(app_handle).await;
        });
      });
      
      Ok(())
    })
    .on_window_event(|window, event| {
      match event {
        tauri::WindowEvent::CloseRequested { api, .. } => {
          window.hide().unwrap();
          api.prevent_close();
        }
        _ => {}
      }
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

async fn create_chat_window(app_handle: &tauri::AppHandle) {
  if let Some(existing_window) = app_handle.get_webview_window("chat-window") {
    println!("Janela de chat já existe, mostrando janela existente");
    let _ = existing_window.show();
    let _ = existing_window.set_focus();
    return;
  }
  
  let next_url = env::var("NEXT_PUBLIC_BASE_URL")
    .unwrap_or_else(|_| "http://localhost:3001".to_string());
  
  let chat_url = if cfg!(debug_assertions) {
    format!("{}/chat-window", next_url)
  } else {
    "tauri://localhost/chat-window".to_string()
  };
  
  println!("Criando janela de chat com URL: {}", chat_url);
  
  let _webview_window = WebviewWindowBuilder::new(
    app_handle,
    "chat-window",
    WebviewUrl::External(chat_url.parse().unwrap())
  )
  .title("Chat - RequestCenter")
  .inner_size(400.0, 600.0)
  .min_inner_size(350.0, 400.0)
  .max_inner_size(600.0, 800.0)
  .resizable(true)
  .center()
  .decorations(true)
  .transparent(false)
  .always_on_top(true)
  .skip_taskbar(false)
  .visible(true)
  .build();
  
  match _webview_window {
    Ok(window) => {
      println!("Janela de chat criada com sucesso: {:?}", window.label());
    },
    Err(e) => {
      eprintln!("Erro ao criar janela de chat: {:?}", e);
    }
  }
}

async fn close_chat_window(app_handle: &tauri::AppHandle) -> Result<(), String> {
  match app_handle.get_webview_window("chat-window") {
    Some(window) => {
      match window.close() {
        Ok(_) => {
          println!("Janela de chat fechada com sucesso");
          Ok(())
        },
        Err(e) => {
          eprintln!("Erro ao fechar janela de chat: {:?}", e);
          Err(format!("Erro ao fechar janela: {:?}", e))
        }
      }
    },
    None => {
      println!("Janela de chat não encontrada ou já fechada");
      Ok(())
    }
  }
}

async fn start_http_server(app_handle: tauri::AppHandle) {
  let app_handle = Arc::new(Mutex::new(app_handle));
  
  let app_handle_open = app_handle.clone();
  let open_chat = warp::path!("tauri" / "open_chat_window")
    .and(warp::post())
    .and(warp::body::json())
    .and(warp::any().map(move || app_handle_open.clone()))
    .and_then(handle_open_chat_window);
  
  let app_handle_close = app_handle.clone();
  let close_chat = warp::path!("tauri" / "close_chat_window")
    .and(warp::post())
    .and(warp::body::json())
    .and(warp::any().map(move || app_handle_close.clone()))
    .and_then(handle_close_chat_window);
  
  let status = warp::path!("tauri" / "status")
    .and(warp::get())
    .map(|| {
      warp::reply::json(&serde_json::json!({
        "status": "ok",
        "message": "Tauri desktop disponível"
      }))
    });
  
  let cors = warp::cors()
    .allow_any_origin()
    .allow_headers(vec!["content-type"])
    .allow_methods(vec!["GET", "POST", "OPTIONS"]);
  
  let routes = open_chat
    .or(close_chat)
    .or(status)
    .with(cors);
  
  let port = env::var("PORTA_TAURI")
    .unwrap_or_else(|_| "3003".to_string())
    .parse::<u16>()
    .unwrap_or(3003);
  
  println!("Servidor HTTP Tauri iniciado em http://localhost:{}", port);
  warp::serve(routes)
    .run(([127, 0, 0, 1], port))
    .await;
}

async fn handle_open_chat_window(
  _body: serde_json::Value,
  app_handle: Arc<Mutex<tauri::AppHandle>>
) -> Result<impl warp::Reply, warp::Rejection> {
  let handle = app_handle.lock().await;
  create_chat_window(&*handle).await;
  
  Ok(warp::reply::json(&serde_json::json!({
    "success": true,
    "message": "Janela de chat aberta via Tauri desktop"
  })))
}

async fn handle_close_chat_window(
  _body: serde_json::Value,
  app_handle: Arc<Mutex<tauri::AppHandle>>
) -> Result<impl warp::Reply, warp::Rejection> {
  let handle = app_handle.lock().await;
  
  match close_chat_window(&*handle).await {
    Ok(_) => {
      Ok(warp::reply::json(&serde_json::json!({
        "success": true,
        "message": "Janela de chat fechada via Tauri desktop"
      })))
    },
    Err(e) => {
      Ok(warp::reply::json(&serde_json::json!({
        "success": false,
        "error": e
      })))
    }
  }
}

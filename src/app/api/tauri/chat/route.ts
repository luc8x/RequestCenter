import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'open_chat_window') {
      try {
        const tauriResponse = await fetch(process.env.URL_TAURI + '/tauri/open_chat_window', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ command: 'open_chat_window' }),
        });
        
        if (tauriResponse.ok) {
          return NextResponse.json({ 
            success: true, 
            method: 'tauri_desktop',
            message: 'Janela de chat aberta via Tauri desktop' 
          });
        }
      } catch {
        console.log('Tauri desktop não disponível, usando fallback web');
      }
      
      return NextResponse.json({ 
        success: true, 
        method: 'web_fallback',
        url: '/chat-window',
        message: 'Usando fallback web - abrir em nova janela' 
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Ação não reconhecida' 
    }, { status: 400 });
    
  } catch (error) {
    console.error('Erro no endpoint de comunicação Tauri:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const tauriResponse = await fetch(process.env.URL_TAURI + '/tauri/status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (tauriResponse.ok) {
      return NextResponse.json({ 
        tauriAvailable: true,
        message: 'Aplicativo Tauri desktop disponível' 
      });
    }
  } catch {
    console.log('Tauri desktop não disponível');
  }
  
  return NextResponse.json({ 
    tauriAvailable: false,
    message: 'Aplicativo Tauri desktop não disponível' 
  });
}
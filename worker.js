// Cloudflare Worker 代码
// 处理聊天请求
async function handleChatRequest(request) {
  const { messages, model = 'qwen-plus', temperature = 0.7, max_tokens = 1024 } = await request.json();
  
  const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${QWEN_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens
    })
  });
  
  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// 处理模型列表请求
function handleModelsRequest() {
  const models = {
    models: [
      { id: 'qwen-plus', name: '通义千问 Plus' },
      { id: 'qwen-turbo', name: '通义千问 Turbo' },
      { id: 'qwen-max', name: '通义千问 Max' }
    ]
  };
  return new Response(JSON.stringify(models), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// 主处理函数
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 绑定环境变量
    globalThis.QWEN_API_KEY = env.QWEN_API_KEY;
    
    if (path === '/api/chat' && request.method === 'POST') {
      return handleChatRequest(request);
    } else if (path === '/api/models' && request.method === 'GET') {
      return handleModelsRequest();
    } else {
      return new Response('Not Found', { status: 404 });
    }
  }
};

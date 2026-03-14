from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import requests
import os
from dotenv import load_dotenv
from pydantic import BaseModel
import json
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 加载环境变量
load_dotenv()

# 获取API密钥
API_KEY = os.getenv("QWEN_API_KEY")

# 通义千问API的基础URL
BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"

# 创建FastAPI应用
app = FastAPI()

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的前端URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载前端静态文件
app.mount("/static", StaticFiles(directory="../frontend/dist"), name="static")

# 定义请求模型
class ChatRequest(BaseModel):
    messages: list
    model: str = "qwen-plus"
    temperature: float = 0.7
    max_tokens: int = 1024

# 定义与Qwen API交互的函数
def get_qwen_response(messages, model="qwen-plus", temperature=0.7, max_tokens=1024):
    logger.info(f"API Key exists: {API_KEY is not None}")
    logger.info(f"API Key length: {len(API_KEY) if API_KEY else 0}")
    logger.info(f"Base URL: {BASE_URL}")
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens
    }
    
    try:
        logger.info(f"Sending request to Qwen API: model={model}, messages_count={len(messages)}")
        logger.info(f"Request payload: {json.dumps(payload, indent=2)}")
        response = requests.post(BASE_URL, headers=headers, json=payload, timeout=30)
        logger.info(f"Qwen API response status: {response.status_code}")
        logger.info(f"Qwen API response headers: {dict(response.headers)}")
        response.raise_for_status()  # 检查响应状态
        response_data = response.json()
        logger.info(f"Received response from Qwen API: {json.dumps(response_data, indent=2)}")
        return response_data
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        if hasattr(e, 'response') and e.response:
            logger.error(f"Response status: {e.response.status_code}")
            logger.error(f"Response content: {e.response.text}")
        raise HTTPException(status_code=500, detail=f"Request error: {str(e)}")
    except Exception as e:
        logger.error(f"Internal error: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

# 定义API端点
@app.post("/api/chat")
async def chat(request: ChatRequest):
    response_data = get_qwen_response(
        request.messages,
        request.model,
        request.temperature,
        request.max_tokens
    )
    return response_data

# 健康检查端点
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# 获取模型列表端点
@app.get("/api/models")
async def get_models():
    return {
        "models": [
            {"id": "qwen-plus", "name": "通义千问 Plus"},
            {"id": "qwen-turbo", "name": "通义千问 Turbo"},
            {"id": "qwen-max", "name": "通义千问 Max"}
        ]
    }

# 根路径返回前端页面
@app.get("/")
async def root():
    return FileResponse("../frontend/dist/index.html")

# 其他路径也返回前端页面，支持前端路由
@app.get("/{path:path}")
async def catch_all(path: str):
    return FileResponse("../frontend/dist/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

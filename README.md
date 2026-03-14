# AI 助手应用

这是一个使用通义千问API的AI交互应用，支持网页版和桌面版。

## 功能特点

- 与通义千问进行对话
- 支持多种模型选择（qwen-plus、qwen-turbo、qwen-max）
- 可调整温度和最大tokens参数
- 支持多对话历史记录
- 响应式设计，适配不同屏幕尺寸
- 支持桌面应用（Windows、Mac、Linux）

## 技术栈

- 前端：React + Vite
- 后端：Python + FastAPI
- 桌面版：Electron

## 快速开始

### 1. 安装依赖

#### 后端依赖
```bash
cd backend
pip install -r requirements.txt
```

#### 前端依赖
```bash
cd frontend
npm install
```

### 2. 配置API Key

在 `backend/.env` 文件中添加你的通义千问API Key：

```
QWEN_API_KEY=your_api_key_here
```

### 3. 运行应用

#### 网页版

1. 启动后端服务：
```bash
cd backend
uvicorn main:app --reload
```

2. 启动前端开发服务器：
```bash
cd frontend
npm run dev
```

3. 打开浏览器访问：`http://localhost:5173`

#### 桌面版

1. 确保后端服务正在运行（见上文）

2. 启动桌面应用：
```bash
cd frontend
npm run electron:dev
```

### 4. 构建桌面应用

```bash
cd frontend
npm run electron:build
```

构建后的应用会生成在 `frontend/dist-electron` 目录中。

## 项目结构

```
Digital Capsule Agent/
├── backend/          # 后端服务
│   ├── .env           # 环境变量配置（存储API Key）
│   ├── main.py        # 后端主文件
│   └── requirements.txt
├── frontend/          # 前端代码
│   ├── electron/      # Electron配置
│   │   ├── main.js    # Electron主入口
│   │   └── preload.js # 预加载脚本
│   ├── public/        # 静态资源
│   ├── src/           # 前端源码
│   │   ├── App.jsx    # 主应用组件
│   │   ├── App.css    # 样式文件
│   │   └── main.tsx   # 应用入口
│   ├── package.json   # 前端依赖配置
│   └── tsconfig.json  # TypeScript配置
└── README.md          # 项目说明
```

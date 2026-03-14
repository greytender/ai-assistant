import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are a helpful assistant.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('qwen-plus');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [chatId, setChatId] = useState(1);
  const [chatHistory, setChatHistory] = useState([{ id: 1, name: '新对话' }]);
  const [currentChat, setCurrentChat] = useState(1);
  const messagesEndRef = useRef(null);

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // 加载模型列表
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/models');
        if (response.ok) {
          const data = await response.json();
          setModels(data.models);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };
    fetchModels();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // 添加用户消息
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      console.log('Sending request to backend API...');
      console.log('Backend URL:', 'http://localhost:8000/api/chat');
      console.log('Request data:', {
        messages: newMessages,
        model: selectedModel,
        temperature: temperature,
        max_tokens: maxTokens
      });
      
      // 调用后端API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          model: selectedModel,
          temperature: temperature,
          max_tokens: maxTokens
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData.detail || ''}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      // 添加AI响应
      setMessages(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
    } catch (error) {
      console.error('Error:', error);
      // 添加错误消息
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = () => {
    const newChatId = chatId + 1;
    setChatId(newChatId);
    setCurrentChat(newChatId);
    setChatHistory(prev => [...prev, { id: newChatId, name: `新对话 ${newChatId}` }]);
    setMessages([{ role: 'system', content: 'You are a helpful assistant.' }]);
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>AI 助手</h2>
          <button className="new-chat-btn" onClick={createNewChat}>+ 新对话</button>
        </div>
        <div className="chat-history">
          {chatHistory.map(chat => (
            <div 
              key={chat.id} 
              className={`chat-item ${currentChat === chat.id ? 'active' : ''}`}
              onClick={() => setCurrentChat(chat.id)}
            >
              {chat.name}
            </div>
          ))}
        </div>
      </div>
      
      <div className="main-content">
        <header className="app-header">
          <h1>AI 对话界面</h1>
          <div className="model-selector">
            <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {models.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
          </div>
        </header>
        
        <div className="chat-container">
          <div className="messages">
            {messages.map((message, index) => {
              if (message.role === 'system') return null;
              return (
                <div key={index} className={`message ${message.role}`}>
                  <div className="message-avatar">
                    {message.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className="message-content">
                    {message.content}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="message assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="loading">AI正在思考...</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="input-container">
            <div className="input-box">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="请输入您的问题..."
              />
              <button onClick={sendMessage} disabled={isLoading}>
                发送
              </button>
            </div>
            <div className="chat-settings">
              <div className="setting-item">
                <label>温度: {temperature.toFixed(1)}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                />
              </div>
              <div className="setting-item">
                <label>最大 tokens: {maxTokens}</label>
                <input
                  type="range"
                  min="256"
                  max="4096"
                  step="256"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>
        
        <footer className="app-footer">
          <p>使用通义千问 API 提供 AI 服务</p>
        </footer>
      </div>
    </div>
  )
}

export default App
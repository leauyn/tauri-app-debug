import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

interface DataItem {
  id: number;
  title: string;
  description: string;
}

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [count, setCount] = useState(0);
  const [serverStatus, setServerStatus] = useState("未启动");
  const [apiData, setApiData] = useState<DataItem[]>([]);
  const [healthStatus, setHealthStatus] = useState("");

  useEffect(() => {
    // 组件加载时启动 Next.js 服务
    startServer();
  }, []);

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  async function increment() {
    const newCount: number = await invoke("increment_counter");
    setCount(newCount);
  }

  async function getCount() {
    const currentCount: number = await invoke("get_counter");
    setCount(currentCount);
  }

  async function startServer() {
    try {
      const result: string = await invoke("start_nextjs_server");
      setServerStatus("运行中");
      console.log(result);
    } catch (error) {
      setServerStatus("启动失败");
      console.error(error);
    }
  }

  async function stopServer() {
    try {
      const result: string = await invoke("stop_nextjs_server");
      setServerStatus("已停止");
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }

  async function checkHealth() {
    try {
      const response: string = await invoke("call_nextjs_api", {
        endpoint: "/api/health",
      });
      const data = JSON.parse(response);
      setHealthStatus(`✅ ${data.status} - ${data.timestamp}`);
    } catch (error) {
      setHealthStatus("❌ 服务不可用");
      console.error(error);
    }
  }

  async function fetchData() {
    try {
      const response: string = await invoke("call_nextjs_api", {
        endpoint: "/api/data",
      });
      const data = JSON.parse(response);
      setApiData(data.data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-8">
          🚀 Tauri 2.0 + Next.js Sidecar
        </h1>

        {/* Sidecar 服务控制 */}
        <div className="mb-8 p-6 bg-purple-50 rounded-xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            🔧 Next.js Sidecar 服务
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-gray-700">状态:</span>
            <span className="font-semibold text-purple-600">{serverStatus}</span>
          </div>
          <div className="flex gap-3">
            <button
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              onClick={startServer}
            >
              启动服务
            </button>
            <button
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              onClick={stopServer}
            >
              停止服务
            </button>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              onClick={checkHealth}
            >
              健康检查
            </button>
            <button
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              onClick={fetchData}
            >
              获取数据
            </button>
          </div>
          {healthStatus && (
            <p className="mt-4 text-sm text-gray-700">{healthStatus}</p>
          )}
        </div>

        {/* API 数据展示 */}
        {apiData.length > 0 && (
          <div className="mb-8 p-6 bg-green-50 rounded-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              📊 Next.js API 数据
            </h2>
            <div className="space-y-3">
              {apiData.map((item) => (
                <div key={item.id} className="p-4 bg-white rounded-lg shadow">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 原有的问候和计数器功能 */}
        <div className="mb-8 p-6 bg-gray-50 rounded-xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            👋 Rust 后端功能
          </h2>
          <div className="flex gap-3 mb-4">
            <input
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              placeholder="输入你的名字..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              onClick={greet}
            >
              问候
            </button>
          </div>
          {greetMsg && <p className="text-lg text-gray-700">{greetMsg}</p>}

          <div className="flex items-center gap-4 mt-4">
            <button
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              onClick={increment}
            >
              增加
            </button>
            <div className="text-3xl font-bold text-indigo-600">{count}</div>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              onClick={getCount}
            >
              刷新
            </button>
          </div>
        </div>

        {/* 技术栈 */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-gray-600">前端</p>
            <p className="font-semibold text-indigo-600">React + TS</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600">桌面</p>
            <p className="font-semibold text-orange-600">Tauri 2.0</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Sidecar</p>
            <p className="font-semibold text-green-600">Next.js</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;


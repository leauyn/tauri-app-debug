import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [count, setCount] = useState(0);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* 标题 */}
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-8">
          🚀 Tauri 2.0 示例应用
        </h1>

        {/* 问候功能 */}
        <div className="mb-8 p-6 bg-gray-50 rounded-xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            👋 问候功能
          </h2>
          <div className="flex gap-3">
            <input
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition"
              placeholder="输入你的名字..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              onClick={greet}
            >
              问候
            </button>
          </div>
          {greetMsg && (
            <p className="mt-4 text-lg text-gray-700 font-medium">
              {greetMsg}
            </p>
          )}
        </div>

        {/* 计数器功能 */}
        <div className="p-6 bg-gray-50 rounded-xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            🔢 计数器功能
          </h2>
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-lg"
              onClick={increment}
            >
              增加
            </button>
            <div className="text-4xl font-bold text-indigo-600 min-w-[80px] text-center">
              {count}
            </div>
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-lg"
              onClick={getCount}
            >
              刷新
            </button>
          </div>
          <p className="text-center text-gray-600 text-sm">
            计数器状态由 Rust 后端管理
          </p>
        </div>

        {/* 技术栈说明 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">前端</p>
              <p className="font-semibold text-indigo-600">
                React + TypeScript + Tailwind
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">后端</p>
              <p className="font-semibold text-orange-600">Rust + Tauri 2.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;


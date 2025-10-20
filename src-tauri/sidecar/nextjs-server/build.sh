#!/bin/bash

set -e

echo "🚀 Building Next.js sidecar server..."

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# 清理旧的依赖和缓存
echo "🧹 Cleaning old dependencies..."
rm -rf node_modules package-lock.json .next

# 安装依赖（使用 legacy-peer-deps 解决冲突）
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# 构建 Next.js
echo "🔨 Building Next.js application..."
npm run build

# 创建输出目录
OUTPUT_DIR="../../binaries/nextjs-server"
echo "📁 Creating output directory: $OUTPUT_DIR"
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# 复制 standalone 文件
echo "📋 Copying standalone files..."
if [ -d ".next/standalone" ]; then
    cp -r .next/standalone/* "$OUTPUT_DIR/"
else
    echo "❌ Error: .next/standalone directory not found"
    exit 1
fi

# 复制 static 文件
echo "📋 Copying static files..."
if [ -d ".next/static" ]; then
    mkdir -p "$OUTPUT_DIR/.next/static"
    cp -r .next/static/* "$OUTPUT_DIR/.next/static/"
fi

# 复制 public 文件
echo "📋 Copying public files..."
if [ -d "public" ]; then
    mkdir -p "$OUTPUT_DIR/public"
    cp -r public/* "$OUTPUT_DIR/public/" 2>/dev/null || true
fi

# 复制启动脚本并修改端口
echo "📋 Copying server script..."
cp server.js "$OUTPUT_DIR/"

# 修改端口为 3001
echo "🔧 Setting port to 3001..."
sed -i '' 's/|| 3000/|| 3001/g' "$OUTPUT_DIR/server.js"

# 创建生产 package.json
echo "📝 Creating production package.json..."
cat > "$OUTPUT_DIR/package.json" << EOF
{
  "name": "nextjs-server",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "next": "15.5.6",
    "react": "19.1.0",
    "react-dom": "19.1.0"
  }
}
EOF

# 安装生产依赖
echo "📦 Installing production dependencies..."
cd "$OUTPUT_DIR"
npm install --production --legacy-peer-deps --no-optional

# 清理
echo "🧹 Cleaning up..."
find . -name "*.map" -type f -delete 2>/dev/null || true
find . -name "*.ts" -not -path "*/node_modules/*" -type f -delete 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

echo "✅ Build complete!"
echo "📦 Output directory: $OUTPUT_DIR"
echo "📊 Size: $(du -sh "$OUTPUT_DIR" 2>/dev/null | cut -f1 || echo 'N/A')"


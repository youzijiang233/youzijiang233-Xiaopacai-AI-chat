#!/bin/bash

echo "🚀 Xiaopacai AI Chat 服务器版 - 快速启动脚本"
echo "================================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js"
    echo "   访问: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo ""

# 进入 web-version 目录
cd "$(dirname "$0")"

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install
    echo ""
fi

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "⚙️  创建默认配置文件..."
    cat > .env << EOF
PORT=5638
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NODE_ENV=development
EOF
    echo "✅ 配置文件已创建: .env"
    echo ""
fi

# 启动服务器
echo "🎯 启动服务器..."
echo ""
echo "================================================"
echo "  访问地址: http://localhost:5638"
echo "  按 Ctrl+C 停止服务器"
echo "================================================"
echo ""

npm start

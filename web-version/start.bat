@echo off
chcp 65001 >nul
echo 🚀 Xiaopacai AI Chat 服务器版 - 快速启动脚本
echo ================================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 未检测到 Node.js，请先安装 Node.js
    echo    访问: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js 版本: %NODE_VERSION%
echo.

REM 进入脚本所在目录
cd /d "%~dp0"

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 📦 首次运行，正在安装依赖...
    call npm install
    echo.
)

REM 检查环境变量文件
if not exist ".env" (
    echo ⚙️  创建默认配置文件...
    (
        echo PORT=3000
        echo SESSION_SECRET=change-this-secret-key-in-production
        echo NODE_ENV=development
    ) > .env
    echo ✅ 配置文件已创建: .env
    echo.
)

REM 启动服务器
echo 🎯 启动服务器...
echo.
echo ================================================
echo   访问地址: http://localhost:3000
echo   按 Ctrl+C 停止服务器
echo ================================================
echo.

call npm start

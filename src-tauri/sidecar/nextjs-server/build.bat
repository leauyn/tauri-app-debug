@echo off
setlocal enabledelayedexpansion

echo 🚀 Building Next.js sidecar server...

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Node.js is not installed
    exit /b 1
)

REM 清理旧的依赖
echo 🧹 Cleaning old dependencies...
if exist "node_modules" rd /s /q "node_modules"
if exist "package-lock.json" del /f /q "package-lock.json"
if exist ".next" rd /s /q ".next"

REM 安装依赖
echo 📦 Installing dependencies...
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

REM 构建 Next.js
echo 🔨 Building Next.js application...
call npm run build
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

REM 创建输出目录
set "OUTPUT_DIR=..\..\binaries\nextjs-server"
echo 📁 Creating output directory: %OUTPUT_DIR%
if exist "%OUTPUT_DIR%" rd /s /q "%OUTPUT_DIR%"
mkdir "%OUTPUT_DIR%"

REM 复制 standalone 文件
echo 📋 Copying standalone files...
if exist ".next\standalone" (
    xcopy /E /I /Y /Q ".next\standalone\*" "%OUTPUT_DIR%\" >nul
) else (
    echo ❌ Error: .next\standalone directory not found
    exit /b 1
)

REM 复制 static 文件
echo 📋 Copying static files...
if exist ".next\static" (
    xcopy /E /I /Y /Q ".next\static" "%OUTPUT_DIR%\.next\static\" >nul
)

REM 复制 public 文件
echo 📋 Copying public files...
if exist "public" (
    xcopy /E /I /Y /Q "public" "%OUTPUT_DIR%\public\" >nul 2>nul
)

REM 复制启动脚本
echo 📋 Copying server script...
copy /Y "server.js" "%OUTPUT_DIR%\" >nul

REM 创建生产 package.json
echo 📝 Creating production package.json...
(
echo {
echo   "name": "nextjs-server",
echo   "version": "0.1.0",
echo   "private": true,
echo   "scripts": {
echo     "start": "node server.js"
echo   },
echo   "dependencies": {
echo     "next": "15.5.6",
echo     "react": "19.1.0",
echo     "react-dom": "19.1.0"
echo   }
echo }
) > "%OUTPUT_DIR%\package.json"

REM 安装生产依赖
echo 📦 Installing production dependencies...
cd /d "%OUTPUT_DIR%"
call npm install --production --legacy-peer-deps --no-optional
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

echo ✅ Build complete!
echo 📦 Output directory: %OUTPUT_DIR%

endlocal


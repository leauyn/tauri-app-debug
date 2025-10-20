#!/system/bin/sh

#================================================================
#   Copyright (C) 2025 All rights reserved.
#
#   文件名称：download-node.sh
#   创 建 者：YongLiao, leauyn@hotmail.com
#   创建日期：2025年10月20日
#   描    述：
#
#================================================================

#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BINARIES_DIR="$SCRIPT_DIR/binaries"
NODE_VERSION="v20.11.0"

mkdir -p "$BINARIES_DIR"

echo "🔍 Detecting system architecture..."
ARCH=$(uname -m)

if [ "$ARCH" = "arm64" ]; then
    echo "📥 Downloading Node.js for Apple Silicon (ARM64)..."
    NODE_ARCH="arm64"
    TARGET="aarch64-apple-darwin"
elif [ "$ARCH" = "x86_64" ]; then
    echo "📥 Downloading Node.js for Intel (x86_64)..."
    NODE_ARCH="x64"
    TARGET="x86_64-apple-darwin"
else
    echo "❌ Unsupported architecture: $ARCH"
    exit 1
fi

NODE_URL="https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-darwin-${NODE_ARCH}.tar.gz"
NODE_FILE="$BINARIES_DIR/node.tar.gz"
NODE_BINARY="$BINARIES_DIR/node-${TARGET}"

# 如果已存在，跳过下载
if [ -f "$NODE_BINARY" ]; then
    echo "✅ Node.js binary already exists: $NODE_BINARY"
    exit 0
fi

echo "📥 Downloading from: $NODE_URL"
curl -L "$NODE_URL" -o "$NODE_FILE"

echo "📦 Extracting..."
tar -xzf "$NODE_FILE" -C "$BINARIES_DIR"

echo "📋 Copying binary..."
cp "$BINARIES_DIR/node-${NODE_VERSION}-darwin-${NODE_ARCH}/bin/node" "$NODE_BINARY"

echo "🧹 Cleaning up..."
rm -rf "$NODE_FILE" "$BINARIES_DIR/node-${NODE_VERSION}-darwin-${NODE_ARCH}"

echo "🔐 Setting permissions..."
chmod +x "$NODE_BINARY"

echo "✅ Node.js binary installed successfully!"
echo "   Location: $NODE_BINARY"
echo "   Version: $($NODE_BINARY --version)"


# リアルタイムチャットアプリケーション

このプロジェクトは、React + TypeScriptのフロントエンドとRuby + Sinatraのバックエンドを使用した、WebSocketベースのリアルタイムチャットアプリケーションです。LLM APIを利用して、ユーザーの質問に対する回答をストリーミング形式で表示します。

## 機能

- リアルタイムチャットインターフェース
- WebSocketを使用したサーバーとの双方向通信
- LLM APIを利用した応答生成
- ストリーミング形式での応答表示
- レスポンシブデザイン

## 技術スタック

### フロントエンド
- React 19
- TypeScript
- Vite
- WebSocket API

### バックエンド
- Ruby
- Sinatra
- sinatra-websocket
- Faraday (HTTP通信)

## セットアップ方法

### 前提条件
- Node.js (v18以上)
- Ruby (v3.0以上)
- Bundler

### インストール手順

1. リポジトリをクローン
```bash
git clone https://github.com/yourusername/chat-app.git
cd chat-app
```

2. フロントエンドの依存関係をインストール
```bash
npm install
```

3. バックエンドの依存関係をインストール
```bash
cd server
bundle install
```

4. 環境変数の設定
```bash
cp server/.env.example server/.env
```
`.env`ファイルを編集して、実際のLLM APIキーとエンドポイントを設定してください。

## 実行方法

### 開発モード

1. フロントエンドの開発サーバーを起動
```bash
npm run dev
```

2. バックエンドサーバーを起動
```bash
cd server
./start.sh
```

### 本番モード

1. フロントエンドをビルド
```bash
npm run build
```

2. バックエンドサーバーを起動（ビルドされたフロントエンドを配信）
```bash
cd server
./start.sh
```

## 使用方法

1. ブラウザで `http://localhost:4567` にアクセス
2. チャットボックスにメッセージを入力して送信
3. AIからのレスポンスがリアルタイムでストリーミング表示されます

## カスタマイズ

- `server/app.rb` の `call_llm_api` 関数を編集して、異なるLLM APIプロバイダーに対応できます
- `src/components/` 内のコンポーネントを編集して、UIをカスタマイズできます
- `src/App.css` を編集して、スタイルをカスタマイズできます

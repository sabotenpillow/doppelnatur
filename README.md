# Werewolf Game Application

オンライン人狼ゲームアプリ - Web上で動作する人狼ゲーム

## プロジェクト構成

```
doppelnature/
├── backend/           # Go言語バックエンド
│   ├── cmd/server/    # メインサーバー
│   ├── internal/
│   │   ├── game/      # ゲームロジック
│   │   ├── room/      # 部屋管理
│   │   └── ws/        # WebSocket処理
│   └── go.mod
└── frontend/          # Next.js フロントエンド
    ├── app/           # Next.js App Router
    ├── components/    # Reactコンポーネント
    ├── hooks/         # カスタムフック
    ├── lib/           # ユーティリティ
    ├── types/         # TypeScript型定義
    └── package.json
```

## 技術スタック

- **フロントエンド**: Next.js 16, TypeScript, Tailwind CSS
- **バックエンド**: Go 1.26
- **リアルタイム通信**: WebSocket
- **データ保存**: メモリ内（永続化なし）

## 実装済み機能

### MVP機能
- ✅ 部屋の作成・入室・退室
- ✅ 複数端末間のリアルタイム同期
- ✅ 役職設定（人狼、村人、占い師、霊媒師、騎士、狂人、狐、双子）
- ✅ ゲーム開始
- ✅ 匿名ユーザー（ニックネームのみ）
- ✅ 管理者権限の自動移譲
- ✅ 役職カード表示（3Dフリップアニメーション付き）
- ✅ 役職アイコン（Lucide Icons使用）
- ✅ 多言語対応（日本語・英語）

### 次フェーズで実装予定
- 昼・夜のターン制御
- 投票システム
- 各役職の能力実行
- 勝敗判定
- ゲーム履歴表示

## セットアップ

### バックエンド

```bash
cd backend
go mod download
go run cmd/server/main.go
```

サーバーは `http://localhost:8080` で起動します。

### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

フロントエンドは `http://localhost:3000` で起動します。

## 使い方

1. フロントエンド (`http://localhost:3001`) にアクセス
2. ニックネームを入力
3. 「新しい部屋を作る」または「部屋に参加する」を選択
4. 管理者が役職を設定
5. 「ゲーム開始」でゲームスタート
6. 役職カードが自動的にフリップされて役職が表示されます

## デモページ

役職カードのデモを確認できます：
- http://localhost:3001/demo

各役職のカードデザインとフリップアニメーションをプレビューできます。

## 部屋コード

- 6文字の英数字（例: ABC123）
- 自動生成
- 重複なし

## 参加人数

- 最大15名まで

## 開発

### バックエンドのビルド

```bash
cd backend
go build -o bin/server ./cmd/server
./bin/server
```

### フロントエンドのビルド

```bash
cd frontend
npm run build
npm start
```

## API設計（WebSocket）

### クライアント → サーバー

- `create_room`: 部屋作成
- `join_room`: 部屋入室
- `leave_room`: 部屋退室
- `set_roles`: 役職設定
- `start_game`: ゲーム開始

### サーバー → クライアント

- `room_created`: 部屋作成完了
- `room_state`: 部屋状態更新
- `player_joined`: プレイヤー入室
- `player_left`: プレイヤー退室
- `roles_updated`: 役職設定更新
- `game_started`: ゲーム開始
- `error`: エラーメッセージ

## ライセンス

MIT

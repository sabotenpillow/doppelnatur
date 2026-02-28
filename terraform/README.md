# Terraform GCP Infrastructure

このディレクトリには、DoppelnatureアプリケーションをGCPにデプロイするためのTerraform構成が含まれています。

## アーキテクチャ

以下のGCPリソースが作成されます：

### コンピューティング
- **Cloud Run (Frontend)**: Next.jsアプリケーション
- **Cloud Run (Backend)**: Go言語製APIサーバー

### ネットワーキング
- **VPC Network**: プライベートネットワーク
- **VPC Access Connector**: Cloud RunからCloud SQLへの接続
- **Cloud Load Balancer**: HTTPSロードバランサー
  - `/api/*` → Backend Cloud Run
  - その他 → Frontend Cloud Run
- **SSL Certificate**: マネージドSSL証明書
- **Global IP Address**: 静的IPアドレス

### データベース
- **Cloud SQL (PostgreSQL 15)**: リージョナル高可用性構成
  - プライベートIP接続
  - 自動バックアップ
  - Point-in-time recovery

### ストレージ
- **Cloud Storage (Assets)**: 静的アセット用
- **Cloud Storage (Uploads)**: アップロードファイル用

## 前提条件

1. GCPプロジェクトの作成
2. Terraformのインストール (>= 1.0)
3. gcloudコマンドラインツールのインストールと認証

```bash
# gcloud CLIのインストール
# https://cloud.google.com/sdk/docs/install

# 認証
gcloud auth application-default login

# プロジェクトの設定
gcloud config set project YOUR_PROJECT_ID
```

4. 必要なGCP APIの有効化

```bash
gcloud services enable \
  compute.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  servicenetworking.googleapis.com \
  vpcaccess.googleapis.com \
  storage.googleapis.com
```

## セットアップ

### 1. 変数ファイルの作成

```bash
cp terraform.tfvars.example terraform.tfvars
```

`terraform.tfvars`を編集して、実際の値を設定します：

```hcl
project_id   = "your-actual-project-id"
project_name = "doppelnature"
region       = "asia-northeast1"

domains = [
  "yourdomain.com",
  "www.yourdomain.com"
]

database_password = "STRONG_SECURE_PASSWORD"

backend_image  = "gcr.io/your-actual-project-id/backend:latest"
frontend_image = "gcr.io/your-actual-project-id/frontend:latest"
```

### 2. Dockerイメージのビルドとプッシュ

#### Backend (Go API)

```bash
cd backend
docker build -t gcr.io/YOUR_PROJECT_ID/backend:latest .
docker push gcr.io/YOUR_PROJECT_ID/backend:latest
```

#### Frontend (Next.js)

```bash
cd frontend
docker build -t gcr.io/YOUR_PROJECT_ID/frontend:latest .
docker push gcr.io/YOUR_PROJECT_ID/frontend:latest
```

### 3. Terraformの初期化

```bash
cd terraform
terraform init
```

### 4. 実行計画の確認

```bash
terraform plan
```

### 5. インフラストラクチャのデプロイ

```bash
terraform apply
```

確認プロンプトで `yes` を入力します。

## デプロイ後の設定

### 1. DNSの設定

Terraformが出力するIPアドレスをDNSに設定します：

```bash
terraform output load_balancer_ip
```

このIPアドレスをドメインのAレコードに設定してください。

### 2. SSL証明書のプロビジョニング待ち

マネージドSSL証明書がプロビジョニングされるまで最大15分かかります。

```bash
gcloud compute ssl-certificates list
```

### 3. データベースマイグレーション

データベースマイグレーションを実行します（Cloud Shellまたはローカルから）：

```bash
# Cloud SQL Proxyを使用
cloud_sql_proxy -instances=CONNECTION_NAME=tcp:5432 &

# マイグレーション実行
cd backend
go run cmd/migrate/main.go
```

## 出力値

デプロイ後、以下の情報が出力されます：

```bash
terraform output
```

- `load_balancer_ip`: ロードバランサーのIPアドレス
- `backend_cloud_run_url`: Backend Cloud RunのURL
- `frontend_cloud_run_url`: Frontend Cloud RunのURL
- `database_connection_name`: Cloud SQL接続名
- `assets_bucket_name`: アセットバケット名
- `uploads_bucket_name`: アップロードバケット名

## コスト最適化

### 開発環境向け

```hcl
db_tier       = "db-f1-micro"
min_instances = 0
max_instances = 3
enable_deletion_protection = false
```

### 本番環境向け

```hcl
db_tier       = "db-custom-2-7680"  # 2 vCPU, 7.68 GB RAM
min_instances = 1
max_instances = 10
enable_deletion_protection = true
```

## トラブルシューティング

### VPC Access Connectorのエラー

VPC Access Connectorの作成に失敗する場合、APIが有効化されているか確認：

```bash
gcloud services enable vpcaccess.googleapis.com
```

### Cloud SQLの接続エラー

1. VPC Peeringが正しく設定されているか確認
2. Cloud Runサービスのログを確認：

```bash
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

### SSL証明書のプロビジョニング失敗

1. DNSレコードが正しく設定されているか確認
2. ドメインがIPアドレスに解決されるか確認：

```bash
nslookup yourdomain.com
```

## クリーンアップ

全てのリソースを削除する場合：

```bash
terraform destroy
```

**警告**: これにより、データベースを含む全てのリソースが削除されます。

## セキュリティのベストプラクティス

1. **terraform.tfvars を Git にコミットしない**
   - `.gitignore` に追加済み

2. **強力なデータベースパスワードを使用**
   - 最低16文字以上
   - 大文字、小文字、数字、記号を含む

3. **Secret Managerの使用を検討**
   - パスワードやAPIキーはSecret Managerで管理

4. **IAMロールの最小権限原則**
   - 必要最小限の権限のみを付与

5. **定期的なバックアップの確認**
   - Cloud SQLの自動バックアップが有効

## 参考資料

- [Terraform Google Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Cloud Load Balancing Documentation](https://cloud.google.com/load-balancing/docs)

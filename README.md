# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## PostgreSQL Database Setup

このプロジェクトではDocker Composeを使用してPostgreSQLデータベースを起動します。

### 環境変数の設定

プロジェクトルートに`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
DB_DATABASE=nasunest
DB_USER=app_user
DB_PASSWORD=app_password
DB_PORT=5432
DB_HOST=localhost
DATABASE_URL=postgres://app_user:app_password@localhost:5432/nasunest
PGADMIN_PORT=8080
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=admin
```

**注意**: 既存の`MYSQL_*`環境変数も引き続きサポートされていますが、`DB_*`環境変数の使用を推奨します。

### Docker Composeの使用方法

PostgreSQLコンテナを起動：
```bash
docker-compose up -d
```

PostgreSQLコンテナを停止：
```bash
docker-compose down
```

PostgreSQLコンテナを停止してデータも削除：
```bash
docker-compose down -v
```

PostgreSQLコンテナのログを確認：
```bash
docker-compose logs postgres
```

### pgAdmin

pgAdminが自動的に起動し、ブラウザからPostgreSQLデータベースを管理できます。

- URL: `http://localhost:8080` (デフォルト)
- メールアドレス: `.env`ファイルで設定した`PGADMIN_EMAIL`（デフォルト: `admin@example.com`）
- パスワード: `.env`ファイルで設定した`PGADMIN_PASSWORD`（デフォルト: `admin`）

pgAdminにログイン後、サーバーを追加する際は以下の情報を使用してください：
- ホスト名/アドレス: `postgres`
- ポート: `5432`
- ユーザー名: `.env`ファイルで設定した`DB_USER`（デフォルト: `app_user`）
- パスワード: `.env`ファイルで設定した`DB_PASSWORD`（デフォルト: `app_password`）

ポート番号は`.env`ファイルの`PGADMIN_PORT`で変更できます。

### 初期化スクリプト

`docker/postgres/init/`ディレクトリに`.sql`ファイルを配置すると、コンテナ起動時に自動的に実行されます。

## Sequelize ORM

このプロジェクトではSequelizeを使用してデータベース操作を行います。

### データベース接続

データベース接続は`server/plugins/database.ts`で自動的に行われます。アプリケーション起動時に自動的に接続されます。

### モデルの作成

モデルは`server/database/models/`ディレクトリに作成します。例として`Member`モデルが含まれています。

`Member`モデルには以下のカラムが定義されています：
- `id` - 主キー
- `name_sei` - 姓（string）
- `name_mei` - 名（string）
- `start_date` - 開始日（date）
- `end_date` - 終了日（date, nullable）
- `mission` - ミッション（string）
- `description` - 説明（string）
- `icon` - アイコン（BLOB, nullable）

新しいモデルを作成する例：

```typescript
// server/database/models/Example.ts
import { sequelize } from '../config'
import { DataTypes, Model } from 'sequelize'

export class Example extends Model {
  public id!: number
  public name!: string
}

Example.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'examples',
    timestamps: true,
  }
)
```

### APIルートの例

`server/api/`ディレクトリにAPIルートを作成できます。例として`members`のGETエンドポイントが含まれています。

- GET `/api/members` - すべてのメンバーを取得
- GET `/api/members/[id]` - 特定のメンバーを取得

### データベースのマイグレーション

マイグレーションファイルは`server/database/migrations/`ディレクトリに作成します。

#### マイグレーションコマンド

- **マイグレーション実行**: `pnpm migrate`
- **マイグレーション状態確認**: `pnpm migrate:status`
- **最後のマイグレーションをロールバック**: `pnpm migrate:rollback`
- **すべてのマイグレーションをロールバック**: `pnpm migrate:undo:all`

#### 新しいマイグレーションファイルの作成

新しいマイグレーションファイルを作成する場合は、`server/database/migrations/`ディレクトリに以下の形式でJavaScriptファイルを作成してください：
- ファイル名: `YYYYMMDDHHMMSS-description.js`
- 例: `20250101120000-add-new-column.js`

マイグレーションファイルのテンプレート：
```javascript
'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    // マイグレーション実行時の処理
  },

  async down(queryInterface, Sequelize) {
    // ロールバック時の処理
  },
}
```

### データベースの同期

開発中にモデルをデータベースに同期するには、`server/database/config.ts`の`syncDB`関数を使用できます。

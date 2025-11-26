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

## MySQL Database Setup

このプロジェクトではDocker Composeを使用してMySQLデータベースを起動します。

### 環境変数の設定

プロジェクトルートに`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=nasunest
MYSQL_USER=app_user
MYSQL_PASSWORD=app_password
MYSQL_PORT=3306
MYSQL_HOST=localhost
DATABASE_URL=mysql://app_user:app_password@localhost:3306/nasunest
PHPMYADMIN_PORT=8080
```

### Docker Composeの使用方法

MySQLコンテナを起動：
```bash
docker-compose up -d
```

MySQLコンテナを停止：
```bash
docker-compose down
```

MySQLコンテナを停止してデータも削除：
```bash
docker-compose down -v
```

MySQLコンテナのログを確認：
```bash
docker-compose logs mysql
```

### phpMyAdmin

phpMyAdminが自動的に起動し、ブラウザからMySQLデータベースを管理できます。

- URL: `http://localhost:8080` (デフォルト)
- サーバー: `mysql`
- ユーザー名: `.env`ファイルで設定した`MYSQL_USER`（デフォルト: `app_user`）
- パスワード: `.env`ファイルで設定した`MYSQL_PASSWORD`（デフォルト: `app_password`）

ポート番号は`.env`ファイルの`PHPMYADMIN_PORT`で変更できます。

### 初期化スクリプト

`docker/mysql/init/`ディレクトリに`.sql`ファイルを配置すると、コンテナ起動時に自動的に実行されます。

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
      type: DataTypes.INTEGER.UNSIGNED,
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

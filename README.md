# ポイ活・転売・回線管理アプリ

Next.js + TypeScript + Tailwind CSS + Supabase を使った、単一ユーザー向けの利益管理アプリです。

## 現在の実装範囲

- Supabase schema SQL
- seed SQL
- 型定義
- 設定 CRUD
- ポイ活 CRUD
- 転売 CRUD
- 回線 CRUD
- 回線月額履歴 CRUD
- ダッシュボード実集計（今年 / 今月 / 月別 / カテゴリ別）

期間フィルタの高度化、CSV 出力、税務出力は次フェーズ想定です。

## セットアップ手順

1. Node.js 20 以上をインストールします。
2. 依存関係をインストールします。
3. Supabase に `schema.sql` と `seed.sql` を適用します。
4. `.env.example` を `.env.local` にコピーして接続情報を設定します。
5. 開発サーバーを起動します。

```bash
npm install
npm run dev
```

## Supabase 接続方法

1. Supabase プロジェクトを作成します。
2. SQL Editor で [schema.sql](supabase/schema.sql) を実行します。
3. 続けて [seed.sql](supabase/seed.sql) を実行します。
4. Project URL、anon key、service role key を取得します。

## 環境変数

`.env.local` に以下を設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

`SUPABASE_SERVICE_ROLE_KEY` はサーバーアクションで使用します。単一ユーザー前提のため最初はこの構成で実装しています。

## seed 投入方法

Supabase SQL Editor で [seed.sql](supabase/seed.sql) を実行してください。初期マスタ候補とサンプルデータが入ります。

## ディレクトリ構成

```text
src/
  app/
    actions/           server actions
    point-activities/  ポイ活画面
    resale/            転売画面
    mobile-lines/      回線画面
    settings/          設定画面
  components/          共通 UI
  features/            画面単位の CRUD 実装
  lib/
    supabase/          Supabase client
    validation/        Zod schema
    calculations.ts    利益計算 utility
    database.types.ts  Supabase 型定義
supabase/
  schema.sql
  seed.sql
```

## 開発サーバ起動方法

```bash
npm run dev
```

Node.js 未導入の環境では起動確認できません。先に Node.js を導入してください。

## 将来拡張ポイント

- RLS を導入して anon key ベースの安全な運用へ移行
- ダッシュボード期間集計と月次レポート
- CSV / 税務出力
- PWA 化
- フィルタ UI と並び替え強化
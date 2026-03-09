# ポイ活・転売・回線管理アプリ Codex提出用 完成指示書 v2

## 1. 目的
PC・iPhone・Androidのブラウザで使える、単一ユーザー向けのWebアプリを実装してください。

このアプリの目的は以下です。
- ポイ活案件の管理
- 転売の仕入・売却・利益管理
- 回線管理（案件回線 / 通常利用回線）
- 見込み / 実利益の集計
- 年間 / 月別 / 期間指定での利益確認

ログイン機能は不要です。
税務出力機能は今回は未実装で構いませんが、後で追加しやすい構成にしてください。

---

## 2. 技術スタック
以下を前提に実装してください。
- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- React Hook Form
- Zod
- date-fns

要件:
- レスポンシブ対応
- PCでは一覧をテーブル中心
- スマホでは一覧をカード表示寄り
- 単一ユーザー前提
- PWA化は後回し

---

## 3. 画面構成
以下の5画面を作成してください。
1. ダッシュボード
2. ポイ活管理
3. 転売管理
4. 回線管理
5. 設定

税務出力画面は今回は作らなくてよいです。

---

## 4. 共通仕様
### 4-1. 見込み / 実利益のルール
全カテゴリで以下を共通ルールとします。
- 完了チェックなし → 見込み
- 完了チェックあり → 実利益

### 4-2. 完了日の考え方
カテゴリごとに意味は違いますが、集計上はすべて「完了日」として統一してください。
- ポイ活の完了日 = 承認日
- 転売の完了日 = 売却日
- 回線の完了日 = 特典反映日

### 4-3. 期間指定
ダッシュボードでは以下の期間を切り替え可能にしてください。
- 今年
- 今月
- 先月
- 直近3か月
- 任意の開始日 / 終了日

### 4-4. 設定値の管理
プルダウン候補は設定画面から以下を追加・編集・有効/無効切替できるようにしてください。
- ポイントサイト
- 仕入先区分
- 販売先区分
- キャリア

削除は基本的に行わず、有効フラグで制御してください。

---

## 5. データモデル

### 5-1. point_sites
ポイ活のポイントサイト候補。

カラム:
- id: uuid, primary key
- name: text, not null
- sort_order: integer, not null, default 0
- is_active: boolean, not null, default true
- created_at: timestamptz, not null
- updated_at: timestamptz, not null

初期候補:
- ハピタス
- ポイントタウン
- モッピー
- ポイントインカム
- ちょびリッチ
- ECナビ
- アメフリ
- えんためねっと
- Powl
- メルカリ

初期候補から除外するもの:
- げん玉
- ワラウ
- COINCOME
- クラシルリワード

---

### 5-2. purchase_sources
転売の仕入先区分。

カラム:
- id: uuid, primary key
- name: text, not null
- sort_order: integer, not null, default 0
- is_active: boolean, not null, default true
- created_at: timestamptz, not null
- updated_at: timestamptz, not null

初期候補:
- 楽天市場
- Yahoo!ショッピング
- Amazon
- 店舗
- その他

補足:
細かい店名はテーブル化しないで、仕入先メモに保存してください。

---

### 5-3. sales_channels
転売の販売先区分。

カラム:
- id: uuid, primary key
- name: text, not null
- sort_order: integer, not null, default 0
- is_active: boolean, not null, default true
- created_at: timestamptz, not null
- updated_at: timestamptz, not null

初期候補:
- メルカリ
- ヤフオク
- 買取業者
- その他

補足:
細かい業者名はテーブル化しないで、販売先メモに保存してください。

---

### 5-4. carriers
回線キャリア候補。

カラム:
- id: uuid, primary key
- name: text, not null
- sort_order: integer, not null, default 0
- is_active: boolean, not null, default true
- created_at: timestamptz, not null
- updated_at: timestamptz, not null

初期候補:
- docomo
- au
- SoftBank
- 楽天モバイル
- UQ mobile
- Y!mobile
- ahamo
- povo
- LINEMO
- mineo
- IIJmio
- その他

除外:
- 日本通信SIM

---

### 5-5. point_activities
ポイ活案件本体。

カラム:
- id: uuid, primary key
- activity_date: date, not null
- point_site_id: uuid, not null, foreign key to point_sites.id
- title: text, not null
- reward_amount: numeric(12,2), not null, default 0
- is_completed: boolean, not null, default false
- completed_date: date, nullable
- condition_note: text, nullable
- inquiry_url: text, nullable
- memo: text, nullable
- created_at: timestamptz, not null
- updated_at: timestamptz, not null

ルール:
- reward_amount は見込み / 実利益共通の金額入力値
- is_completed = false のとき見込み
- is_completed = true のとき実利益
- completed_date は承認日の意味

集計日:
- completed_date があればそれを優先
- なければ activity_date

---

### 5-6. resale_transactions
転売管理本体。

カラム:
- id: uuid, primary key
- purchase_date: date, not null
- item_name: text, not null
- purchase_source_id: uuid, not null, foreign key to purchase_sources.id
- purchase_source_note: text, nullable
- sales_channel_id: uuid, not null, foreign key to sales_channels.id
- sales_channel_note: text, nullable
- purchase_amount: numeric(12,2), not null, default 0
- sale_amount: numeric(12,2), nullable
- sale_date: date, nullable
- discount_amount: numeric(12,2), not null, default 0
- shipping_fee: numeric(12,2), not null, default 0
- fee_amount: numeric(12,2), not null, default 0
- other_expense: numeric(12,2), not null, default 0
- is_completed: boolean, not null, default false
- memo: text, nullable
- created_at: timestamptz, not null
- updated_at: timestamptz, not null

利益計算式:
profit = coalesce(sale_amount, 0) - purchase_amount - shipping_fee - fee_amount - other_expense + discount_amount

ルール:
- sale_amount は仮入力OK、後で手動修正可能
- is_completed = true のとき実利益集計対象
- 完了基準は「売れたら完了」
- 入金済ステータスは不要

集計日:
- sale_date があればそれを優先
- なければ purchase_date

---

### 5-7. mobile_lines
回線管理本体。

カラム:
- id: uuid, primary key
- contract_date: date, not null
- line_type: text, not null
- carrier_id: uuid, not null, foreign key to carriers.id
- phone_number: text, not null
- registered_email: text, nullable
- management_id: text, nullable
- title: text, not null
- reward_amount: numeric(12,2), nullable
- initial_cost: numeric(12,2), not null, default 0
- cancellation_cost: numeric(12,2), not null, default 0
- cancellation_date: date, nullable
- completed_date: date, nullable
- contract_status: text, not null, default 'active'
- device_name: text, nullable
- return_due_date: date, nullable
- returned_date: date, nullable
- is_completed: boolean, not null, default false
- memo: text, nullable
- created_at: timestamptz, not null
- updated_at: timestamptz, not null

line_type の値:
- campaign = 案件回線
- normal = 通常利用回線

contract_status の値:
- active = 維持中
- cancelled = 解約済

ルール:
- completed_date は特典反映日の意味
- profit集計対象は line_type = campaign のみ
- contract_status は契約管理用であり、利益集計条件ではない
- 電話番号はDBにはフル保存し、UIではマスク表示
- 回線は「利益管理」と「契約管理」を分けて扱う
- 完了済だが維持中、という状態を許容する

集計日:
- completed_date があればそれを優先
- なければ cancellation_date
- なければ contract_date

---

### 5-8. mobile_line_monthly_costs
回線の月額履歴。

カラム:
- id: uuid, primary key
- mobile_line_id: uuid, not null, foreign key to mobile_lines.id
- start_date: date, not null
- end_date: date, nullable
- monthly_fee: numeric(12,2), not null, default 0
- memo: text, nullable
- created_at: timestamptz, not null
- updated_at: timestamptz, not null

ルール:
- 1回線に複数行持てる
- 月額変更に対応するため別テーブル
- 厳密な日割り計算は不要
- まずは登録された monthly_fee の合計で扱う

総コスト:
total_cost = initial_cost + cancellation_cost + sum(monthly_fee)

利益:
profit = reward_amount - total_cost

normal回線は profit を計算してもよいが、ダッシュボード利益集計には含めない

---

## 6. 画面仕様

### 6-1. ダッシュボード
表示内容:
- 期間切替
- 実利益合計
- 見込み合計
- ポイ活 実利益 / 見込み
- 転売 実利益 / 見込み
- 回線 実利益 / 見込み
- ポイ活 未完了件数
- 転売 未完了件数
- 回線 未完了件数

ルール:
- 回線利益集計には line_type = campaign のみ含める
- normal は利益合計には含めない

UI:
- PC: KPIカード + 下にカテゴリ別カード
- スマホ: KPIカードを縦並び

---

### 6-2. ポイ活管理
一覧表示:
- 実施日
- ポイントサイト
- 案件名
- 報酬額
- 完了チェック
- 完了日

フィルタ:
- 年
- 月
- ポイントサイト
- 完了 / 未完了

登録/編集フォーム:
- 実施日
- ポイントサイト
- 案件名
- 報酬額
- 完了チェック
- 完了日
- 条件メモ
- 問い合わせリンク
- メモ

---

### 6-3. 転売管理
一覧表示:
- 仕入日
- 商品名
- 仕入先区分
- 販売先区分
- 仕入額
- 売却額
- 利益
- 完了チェック

フィルタ:
- 年
- 月
- 完了 / 未完了
- 仕入先区分
- 販売先区分

登録/編集フォーム:
- 仕入日
- 商品名
- 仕入先区分
- 仕入先メモ
- 販売先区分
- 販売先メモ
- 仕入額
- 売却額
- 売却日
- 仕入値引き分
- 送料
- 手数料
- その他経費
- 完了チェック
- メモ

表示:
- 利益は自動計算表示
- DBには profit を保存しなくてもよい
- view を使ってもよい

---

### 6-4. 回線管理
一覧表示:
- 契約日
- 回線種別
- キャリア
- 電話番号（UIでは一部マスク）
- 案件名
- 報酬額
- 総コスト
- 利益
- 完了チェック
- 契約ステータス

フィルタ:
- 年
- 月
- 回線種別
- キャリア
- 完了 / 未完了
- 契約ステータス

登録/編集フォーム:
- 契約日
- 回線種別
- キャリア
- 電話番号
- 登録メール
- 管理ID
- 案件名
- 報酬額
- 初期費用
- 解約費用
- 解約日
- 完了日（特典反映日）
- 契約ステータス（維持中 / 解約済）
- 端末名
- 返却期限
- 返却完了日
- 完了チェック
- メモ

月額履歴サブフォーム:
- 開始日
- 終了日
- 月額料金
- メモ
- 行追加 / 行削除可能

表示:
- 総コストを自動計算表示
- 利益を自動計算表示
- 完了済は緑系バッジ
- 解約済はグレーまたは青グレー系バッジ
- 両方該当する場合は [完了] [解約済] の2バッジ表示

---

### 6-5. 設定画面
管理対象:
- ポイントサイト
- 仕入先区分
- 販売先区分
- キャリア

機能:
- 一覧表示
- 新規追加
- 編集
- 並び順変更
- 有効 / 無効切替

注意:
- 無効化しても過去データ表示は崩さないこと

---

## 7. バリデーション
### 共通
- 金額は 0 以上
- 日付は妥当な形式
- inquiry_url のみ URL形式チェック

### ポイ活必須
- activity_date
- point_site_id
- title
- reward_amount

### 転売必須
- purchase_date
- item_name
- purchase_source_id
- sales_channel_id
- purchase_amount

sale_amount は任意

### 回線必須
- contract_date
- line_type
- carrier_id
- phone_number
- title
- initial_cost

reward_amount は normal の場合は任意でよい
campaign の場合は入力推奨

追加のチェック制約:
- line_type in ('campaign', 'normal')
- contract_status in ('active', 'cancelled')

---

## 8. 計算ロジック
共通 utility 関数に切り出してください。

### ポイ活
- is_completed = false → 見込み
- is_completed = true → 実利益
- 金額は reward_amount をそのまま使う

### 転売
profit = (sale_amount ?? 0) - purchase_amount - shipping_fee - fee_amount - other_expense + discount_amount

### 回線
monthly_cost_total = sum(monthly_fee)
total_cost = initial_cost + cancellation_cost + monthly_cost_total
profit = reward_amount - total_cost

補足:
- reward_amount が null の場合は 0 として計算してよい
- normal回線は利益を計算してもよいが、ダッシュボード利益集計には含めない

---

## 9. 保存方針
DBには元データのみ保存してください。
以下は固定保存しなくてよいです。
- 利益合計
- ダッシュボード集計値
- 総コスト確定値

これらは表示時に計算してください。

必要ならSupabaseの view を作っても構いません。
候補:
- resale_transactions_with_profit
- mobile_lines_with_costs

---

## 10. UI方針
### PC
- テーブル表示中心
- ヘッダ固定
- フィルタ上部配置

### スマホ
- カード表示中心
- タップで編集画面へ遷移
- 新規追加ボタンを押しやすい位置に配置

---

## 11. 実装優先順位
### フェーズ1
- Supabase schema SQL作成
- seed SQL作成
- 型定義作成
- ポイ活CRUD
- 転売CRUD
- 回線CRUD
- 月額履歴CRUD
- 設定CRUD

### フェーズ2
- ダッシュボード集計
- 期間フィルタ
- スマホ表示調整

### フェーズ3
- CSV出力
- 税務出力
- PWA化

---

## 12. Supabase実装方針
- schema SQL を出力すること
- seed SQL を出力すること
- 型定義を生成し、フロントから型安全に扱うこと
- 可能ならサーバーアクションか API route でCRUDをまとめること
- 単一ユーザー前提のため、RLSは最小限でもよいが、将来追加しやすい形にすること

---

## 13. 生成してほしい成果物
以下を作成してください。
1. Next.js プロジェクト一式
2. Supabase schema SQL
3. seed SQL
4. 各画面UI
5. 共通コンポーネント
6. 計算 utility
7. README

READMEには以下を含めてください。
- セットアップ手順
- Supabase接続方法
- 環境変数設定
- 開発サーバ起動方法
- seed投入方法
- ディレクトリ構成
- 将来拡張ポイント

---

## 14. 短い依頼文
以下の短縮版も使えるようにしてください。

```text
Next.js + TypeScript + Tailwind + Supabaseで、単一ユーザー向けの利益管理Webアプリを実装してください。

画面は以下の5つです。
1. ダッシュボード
2. ポイ活管理
3. 転売管理
4. 回線管理
5. 設定

共通ルール:
- 完了チェックなしは見込み、完了チェックありは実利益
- ダッシュボードは年間 / 月別 / 期間指定に対応
- PCはテーブル、スマホはカード表示寄り
- ログイン不要
- 税務出力は未実装でよい

データモデル:
- point_sites
- purchase_sources
- sales_channels
- carriers
- point_activities
- resale_transactions
- mobile_lines
- mobile_line_monthly_costs

主な仕様:
- ポイ活は 実施日, ポイントサイト, 案件名, 報酬額, 完了チェック, 完了日 を持つ
- 転売は 仕入日, 商品名, 仕入先区分, 販売先区分, 仕入額, 売却額, 仕入値引き分, 送料, 手数料, その他経費, 完了チェック を持つ
- 転売利益 = 売却額 - 仕入額 - 送料 - 手数料 - その他経費 + 仕入値引き分
- 回線は 契約日, 回線種別(campaign/normal), キャリア, 電話番号, 登録メール, 管理ID, 案件名, 報酬額, 初期費用, 解約費用, 完了日(特典反映日), 解約日, 契約ステータス(active/cancelled), 端末名, 返却期限, 返却完了日, 完了チェック を持つ
- 回線月額履歴は複数行追加可能
- 回線総コスト = 初期費用 + 解約費用 + 月額履歴合計
- 回線利益 = 報酬額 - 総コスト
- normal回線は利益集計対象外
- 電話番号はDBにフル保存し、画面ではマスク表示

設定画面で以下を追加・編集・有効/無効切替できるようにしてください。
- ポイントサイト
- 仕入先区分
- 販売先区分
- キャリア

必要なもの:
- Supabase schema SQL
- seed SQL
- 型定義
- CRUD実装
- ダッシュボード集計
- README
```

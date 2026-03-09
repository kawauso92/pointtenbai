export function ConfigurationNotice() {
  return (
    <div className="rounded-2xl border border-prospect/30 bg-prospect-bg px-4 py-3 text-sm text-prospect">
      Supabase の環境変数が未設定です。画面は表示できますが、一覧取得と保存は動作しません。
    </div>
  );
}

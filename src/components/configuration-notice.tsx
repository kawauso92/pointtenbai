export function ConfigurationNotice() {
  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      Supabase の環境変数が未設定です。画面は表示できますが、一覧取得と保存は動作しません。
    </div>
  );
}
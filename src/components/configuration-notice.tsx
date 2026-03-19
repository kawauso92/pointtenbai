export function ConfigurationNotice() {
  return (
    <div className="rounded-xl border border-prospect/30 bg-prospect-bg px-3.5 py-2.5 text-[13px] text-prospect md:text-sm">
      Supabase の環境変数が未設定です。画面は表示できますが、一覧取得と保存は動作しません。
    </div>
  );
}

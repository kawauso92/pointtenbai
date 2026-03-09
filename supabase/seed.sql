insert into public.point_sites (id, name, sort_order, is_active) values
  ('10000000-0000-0000-0000-000000000001', 'ハピタス', 10, true),
  ('10000000-0000-0000-0000-000000000002', 'ポイントタウン', 20, true),
  ('10000000-0000-0000-0000-000000000003', 'モッピー', 30, true),
  ('10000000-0000-0000-0000-000000000004', 'ポイントインカム', 40, true),
  ('10000000-0000-0000-0000-000000000005', 'ちょびリッチ', 50, true),
  ('10000000-0000-0000-0000-000000000006', 'ECナビ', 60, true),
  ('10000000-0000-0000-0000-000000000007', 'アメフリ', 70, true),
  ('10000000-0000-0000-0000-000000000008', 'えんためねっと', 80, true),
  ('10000000-0000-0000-0000-000000000009', 'Powl', 90, true),
  ('10000000-0000-0000-0000-000000000010', 'メルカリ', 100, true)
on conflict (id) do update set
  name = excluded.name,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.purchase_sources (id, name, sort_order, is_active) values
  ('20000000-0000-0000-0000-000000000001', '楽天市場', 10, true),
  ('20000000-0000-0000-0000-000000000002', 'Yahoo!ショッピング', 20, true),
  ('20000000-0000-0000-0000-000000000003', 'Amazon', 30, true),
  ('20000000-0000-0000-0000-000000000004', '店舗', 40, true),
  ('20000000-0000-0000-0000-000000000005', 'その他', 50, true)
on conflict (id) do update set
  name = excluded.name,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.sales_channels (id, name, sort_order, is_active) values
  ('30000000-0000-0000-0000-000000000001', 'メルカリ', 10, true),
  ('30000000-0000-0000-0000-000000000002', 'ヤフオク', 20, true),
  ('30000000-0000-0000-0000-000000000003', '買取業者', 30, true),
  ('30000000-0000-0000-0000-000000000004', 'その他', 40, true)
on conflict (id) do update set
  name = excluded.name,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.carriers (id, name, sort_order, is_active) values
  ('40000000-0000-0000-0000-000000000001', 'docomo', 10, true),
  ('40000000-0000-0000-0000-000000000002', 'au', 20, true),
  ('40000000-0000-0000-0000-000000000003', 'SoftBank', 30, true),
  ('40000000-0000-0000-0000-000000000004', '楽天モバイル', 40, true),
  ('40000000-0000-0000-0000-000000000005', 'UQ mobile', 50, true),
  ('40000000-0000-0000-0000-000000000006', 'Y!mobile', 60, true),
  ('40000000-0000-0000-0000-000000000007', 'ahamo', 70, true),
  ('40000000-0000-0000-0000-000000000008', 'povo', 80, true),
  ('40000000-0000-0000-0000-000000000009', 'LINEMO', 90, true),
  ('40000000-0000-0000-0000-000000000010', 'mineo', 100, true),
  ('40000000-0000-0000-0000-000000000011', 'IIJmio', 110, true),
  ('40000000-0000-0000-0000-000000000012', 'その他', 120, true)
on conflict (id) do update set
  name = excluded.name,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.point_activities (
  id,
  activity_date,
  point_site_id,
  title,
  reward_amount,
  is_completed,
  completed_date,
  condition_note,
  inquiry_url,
  memo
) values
  (
    '50000000-0000-0000-0000-000000000001',
    '2026-03-01',
    '10000000-0000-0000-0000-000000000001',
    'クレジットカード発行',
    12000,
    true,
    '2026-03-05',
    '初回利用で承認',
    'https://example.com/inquiry/point-1',
    'サンプル完了案件'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '2026-03-07',
    '10000000-0000-0000-0000-000000000003',
    '証券口座開設',
    8000,
    false,
    null,
    '入金条件あり',
    null,
    'サンプル見込み案件'
  )
on conflict (id) do update set
  activity_date = excluded.activity_date,
  point_site_id = excluded.point_site_id,
  title = excluded.title,
  reward_amount = excluded.reward_amount,
  is_completed = excluded.is_completed,
  completed_date = excluded.completed_date,
  condition_note = excluded.condition_note,
  inquiry_url = excluded.inquiry_url,
  memo = excluded.memo;

insert into public.resale_transactions (
  id,
  purchase_date,
  item_name,
  purchase_source_id,
  purchase_source_note,
  sales_channel_id,
  sales_channel_note,
  purchase_amount,
  sale_amount,
  sale_date,
  discount_amount,
  shipping_fee,
  fee_amount,
  other_expense,
  is_completed,
  memo
) values
  (
    '60000000-0000-0000-0000-000000000001',
    '2026-03-02',
    'ワイヤレスイヤホン',
    '20000000-0000-0000-0000-000000000001',
    'スーパーSALE',
    '30000000-0000-0000-0000-000000000001',
    '通常出品',
    9800,
    13800,
    '2026-03-04',
    1000,
    750,
    1380,
    0,
    true,
    'サンプル完了取引'
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    '2026-03-06',
    'モバイルバッテリー',
    '20000000-0000-0000-0000-000000000003',
    null,
    '30000000-0000-0000-0000-000000000002',
    null,
    3500,
    null,
    null,
    0,
    0,
    0,
    0,
    false,
    'サンプル未完了取引'
  )
on conflict (id) do update set
  purchase_date = excluded.purchase_date,
  item_name = excluded.item_name,
  purchase_source_id = excluded.purchase_source_id,
  purchase_source_note = excluded.purchase_source_note,
  sales_channel_id = excluded.sales_channel_id,
  sales_channel_note = excluded.sales_channel_note,
  purchase_amount = excluded.purchase_amount,
  sale_amount = excluded.sale_amount,
  sale_date = excluded.sale_date,
  discount_amount = excluded.discount_amount,
  shipping_fee = excluded.shipping_fee,
  fee_amount = excluded.fee_amount,
  other_expense = excluded.other_expense,
  is_completed = excluded.is_completed,
  memo = excluded.memo;

insert into public.mobile_lines (
  id,
  contract_date,
  line_type,
  carrier_id,
  phone_number,
  registered_email,
  management_id,
  title,
  reward_amount,
  initial_cost,
  cancellation_cost,
  cancellation_date,
  completed_date,
  contract_status,
  device_name,
  return_due_date,
  returned_date,
  is_completed,
  memo
) values
  (
    '70000000-0000-0000-0000-000000000001',
    '2026-02-20',
    'campaign',
    '40000000-0000-0000-0000-000000000004',
    '09011112222',
    'campaign@example.com',
    'rakuten-001',
    '回線案件A',
    20000,
    3300,
    1100,
    '2026-03-03',
    '2026-03-06',
    'cancelled',
    'Android端末',
    null,
    null,
    true,
    'サンプル完了回線'
  ),
  (
    '70000000-0000-0000-0000-000000000002',
    '2026-03-05',
    'normal',
    '40000000-0000-0000-0000-000000000007',
    '08033334444',
    'normal@example.com',
    'ahamo-main',
    'メイン回線',
    null,
    0,
    0,
    null,
    null,
    'active',
    'iPhone',
    null,
    null,
    false,
    '通常利用回線のサンプル'
  )
on conflict (id) do update set
  contract_date = excluded.contract_date,
  line_type = excluded.line_type,
  carrier_id = excluded.carrier_id,
  phone_number = excluded.phone_number,
  registered_email = excluded.registered_email,
  management_id = excluded.management_id,
  title = excluded.title,
  reward_amount = excluded.reward_amount,
  initial_cost = excluded.initial_cost,
  cancellation_cost = excluded.cancellation_cost,
  cancellation_date = excluded.cancellation_date,
  completed_date = excluded.completed_date,
  contract_status = excluded.contract_status,
  device_name = excluded.device_name,
  return_due_date = excluded.return_due_date,
  returned_date = excluded.returned_date,
  is_completed = excluded.is_completed,
  memo = excluded.memo;

insert into public.mobile_line_monthly_costs (
  id,
  mobile_line_id,
  start_date,
  end_date,
  monthly_fee,
  memo
) values
  (
    '80000000-0000-0000-0000-000000000001',
    '70000000-0000-0000-0000-000000000001',
    '2026-02-20',
    '2026-02-28',
    2980,
    '初月料金'
  ),
  (
    '80000000-0000-0000-0000-000000000002',
    '70000000-0000-0000-0000-000000000001',
    '2026-03-01',
    '2026-03-31',
    2980,
    '翌月料金'
  ),
  (
    '80000000-0000-0000-0000-000000000003',
    '70000000-0000-0000-0000-000000000002',
    '2026-03-05',
    null,
    2970,
    '通常回線の月額'
  )
on conflict (id) do update set
  mobile_line_id = excluded.mobile_line_id,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  monthly_fee = excluded.monthly_fee,
  memo = excluded.memo;
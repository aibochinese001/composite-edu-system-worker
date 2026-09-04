-- louisprive membership plans (复刻 m.your-worker.workers.dev 会员管理)
CREATE TABLE IF NOT EXISTS membership_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  duration_type TEXT NOT NULL DEFAULT 'month',  -- day | month | year | forever
  duration_value INTEGER NOT NULL DEFAULT 1,     -- 天数/月数/年数；forever 忽略
  price REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  benefits TEXT DEFAULT '',                      -- 权益描述，换行分隔
  sort_order INTEGER NOT NULL DEFAULT 0,
  status INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 注意：SQL 中 \n 是字面反斜杠+n，必须用 char(10) 表示真实换行
-- 种子数据沿用 louisprive 生产 settings 现有定价：月度$6 / 季度$15 / 年度$50（英文站）
INSERT OR IGNORE INTO membership_plans (key, name, duration_type, duration_value, price, currency, benefits, sort_order, status) VALUES
  ('monthly', 'Monthly', 'month', 1, 6, 'USD', 'Unlock all paid articles' || char(10) || 'Unlock all paid courses' || char(10) || 'Free virtual products', 1, 1),
  ('quarterly', 'Quarterly', 'month', 3, 15, 'USD', 'Unlock all paid articles' || char(10) || 'Unlock all paid courses' || char(10) || 'Free virtual products', 2, 1),
  ('annual', 'Annual', 'year', 1, 50, 'USD', 'Unlock all paid articles' || char(10) || 'Unlock all paid courses' || char(10) || 'Free virtual products' || char(10) || 'Priority support', 3, 1);

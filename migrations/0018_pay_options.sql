-- louisprive 0018: 私域支付方式 (Pay Options)
CREATE TABLE IF NOT EXISTS pay_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                -- 支付方式名称（如 USDT TRC20 / Alipay / WeChat）
  icon TEXT NOT NULL DEFAULT '',     -- 图标 URL（/media/... 上传）
  qr_code TEXT DEFAULT '',           -- 收款码图片 URL（方式1）
  account_info TEXT DEFAULT '',      -- 账号详情文本（方式2）
  link_url TEXT DEFAULT '',          -- 跳转新标签页链接（方式3）
  sort_order INTEGER NOT NULL DEFAULT 0,
  status INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_pay_options_status ON pay_options(status, sort_order);

-- louisprive 0017: 资料库 (Library) - 分类 + 文件资料
CREATE TABLE IF NOT EXISTS library_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS library_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER DEFAULT NULL,        -- NULL = 未分类
  filename TEXT NOT NULL,                  -- 显示名（可中文/英文）
  icon TEXT NOT NULL DEFAULT '',           -- 图标（emoji 或图片 URL）
  file_url TEXT NOT NULL,                  -- 下载/查看 URL（/media/... 或外链）
  file_size INTEGER NOT NULL DEFAULT 0,    -- 字节
  ext TEXT NOT NULL DEFAULT '',            -- 小写扩展名（不含点）
  description TEXT DEFAULT '',             -- 简介（可选）
  sort_order INTEGER NOT NULL DEFAULT 0,
  status INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_library_files_cat ON library_files(category_id, status);
CREATE INDEX IF NOT EXISTS idx_library_files_created ON library_files(id DESC);

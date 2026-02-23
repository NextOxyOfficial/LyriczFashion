ALTER TABLE products_designlibraryitem ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'pending';
ALTER TABLE products_designlibraryitem ADD COLUMN IF NOT EXISTS rejection_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE products_designlibraryitem ALTER COLUMN is_active SET DEFAULT false;
INSERT INTO django_migrations (app, name, applied) VALUES ('products', '0023_designlibraryitem_approval_status', NOW()) ON CONFLICT DO NOTHING;

# Migration references

This file is intentionally short and reference-heavy.

## No formal migration framework

- `backend/src/app.module.ts` — TypeORM config uses `synchronize` in non-production.
- `backend/package.json` — dependencies include `typeorm`, `sqlite3`; no migration runner package.
- `backend/schema.sql` — baseline schema snapshot, not a migration chain.

## Schema / column additions (entity-first)

- `0cdd57e` — added `role`
  - `backend/src/users/user.entity.ts`
  - `backend/src/users/users.service.ts`
- `f74815c` — added `company_name`
  - `backend/src/users/profile.entity.ts`
  - `backend/src/auth/auth.service.ts`
- `873d2b6` — added `category_en`
  - `backend/src/products/product.entity.ts`
  - `backend/src/products/products.controller.ts`
  - `backend/src/products/products.service.ts`
- `7e53e0d` — added `delivery_type` and `delivery_address_text`
  - `backend/src/orders/order.entity.ts`
  - `backend/src/orders/orders.service.ts`

## Data migrations / backfills

- `9462400` — password migration script switched to sqlite3
  - `scripts/migrate-passwords.js`
- `78ea5da` — inspect-db + migrate-passwords cleanup
  - `scripts/inspect-db.js`
  - `scripts/migrate-passwords.js`
- `eec7dff` — order status normalization introduced
  - `scripts/normalize-order-status.js`
- `2fabe5b` — normalize-order-status script switched to sqlite3
  - `scripts/normalize-order-status.js`

## Manual schema patching inside scripts

- `0cdd57e` — `scripts/seed-admin.js` runs `ALTER TABLE users ADD COLUMN role TEXT DEFAULT "client"`
  - `scripts/seed-admin.js`

## Feature-integrated data updates

- `873d2b6` — category rename endpoint updates existing products
  - `backend/src/products/products.service.ts`
- `7e53e0d` — order creation maps new delivery fields
  - `backend/src/orders/orders.service.ts`

## Operational SQL / deployment helpers

- `backend/run_remote_sql.js`
- `backend/generate_sql.js`
- `backend/update_remote_images.sql`
- `backend/scripts/deploy-data.js`
- `backend/scripts/import-jhoanes-3.js`
- `backend/scripts/sync-images-by-name.js`

## Schema baseline

- `a7d7b6a` — initial `backend/schema.sql`
- `backend/schema.sql`

## Takeaway

When a new column was needed, the historical pattern was:

- add it to the TypeORM entity
- update service/controller logic
- rely on `synchronize` in dev
- use a one-off script or direct SQL only when existing rows needed backfilling

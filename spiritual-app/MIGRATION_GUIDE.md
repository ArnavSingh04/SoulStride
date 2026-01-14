# 🚀 Complete Migration Guide

## Overview
This guide will help you migrate all prayer and Guru Granth Sahib data from local TypeScript files to your Supabase PostgreSQL database.

---

## 📋 Prerequisites

- ✅ Supabase project created
- ✅ Project URL: `https://xehvbppisebbzwolyfxj.supabase.co`
- ✅ API Key configured in `lib/supabase.ts`
- ✅ Node.js and npm installed

---

## 🏗️ Step 1: Create Database Tables

### Option A: Using Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor**
   - Visit: https://supabase.com/dashboard/project/xehvbppisebbzwolyfxj/sql
   - Click "SQL Editor" in the left sidebar

2. **Run the Schema**
   - Open the file: `lib/supabase-schema.sql` in your code editor
   - Copy the **entire** contents (Ctrl+A, then Ctrl+C)
   - Paste into the Supabase SQL Editor
   - Click the "Run" button (or press Ctrl+Enter)

3. **Verify Tables Created**
   - Go to "Table Editor" in the Supabase dashboard
   - You should see 4 new tables:
     - `holy_books`
     - `bani_lines`
     - `prayers`
     - `prayer_lines`

### Option B: Using npm script

```bash
npm run db:test
```

This will test the connection and guide you through the setup process.

---

## 📤 Step 2: Migrate Data

### Test Connection First

```bash
npm run db:test
```

Expected output:
```
✅ Successfully connected to Supabase!
✅ Tables exist and are accessible
```

### Migrate Prayers (Quick - ~10 seconds)

```bash
npm run migrate:prayers
```

This will migrate:
- Japji Sahib
- Rehraas Sahib
- Kirtan Sohila
- Ardas
- Sukhmani Sahib
- Asa Di Var

Expected output:
```
🙏 Starting prayers migration to Supabase...
✅ Migrated: Japji Sahib (6 lines)
✅ Migrated: Rehraas Sahib (6 lines)
...
🎉 Prayers migration completed!
```

### Migrate Guru Granth Sahib (Takes ~15-20 minutes)

```bash
npm run migrate:ggs
```

This will migrate:
- All 1430+ pages
- 393,000+ lines of bani
- Complete Guru Granth Sahib Ji

Expected output:
```
📖 Starting Guru Granth Sahib migration to Supabase...
✅ Holy book record created
⏳ Progress: 100/1430 pages migrated...
⏳ Progress: 200/1430 pages migrated...
...
🎉 Guru Granth Sahib migration completed!
```

**Note:** This migration is CPU and network intensive. Make sure you have:
- Stable internet connection
- Sufficient time (~15-20 minutes)
- Don't close the terminal during migration

### Migrate Everything at Once

```bash
npm run migrate:all
```

This runs both migrations sequentially.

---

## ✅ Step 3: Verify Migration

After migration, test the connection again:

```bash
npm run db:test
```

Expected output:
```
✅ Successfully connected to Supabase!
✅ Tables exist and are accessible

📊 Current data:
   Prayers: 6
   Bani Lines: 393000+

✨ Database is ready!
```

---

## 🎯 Step 4: Test the App

1. **Start the app**
   ```bash
   npm start
   ```

2. **Test features:**
   - ✅ View prayers list
   - ✅ Search prayers
   - ✅ Read prayer content
   - ✅ Open Guru Granth Sahib reader
   - ✅ Navigate pages
   - ✅ Search bani

---

## 🔍 Troubleshooting

### Tables don't exist

**Error:** `Could not find the table 'public.holy_books'`

**Solution:**
1. Go to Supabase SQL Editor
2. Run `lib/supabase-schema.sql`
3. Verify tables in Table Editor

### Connection timeout

**Error:** `fetch failed` or timeout

**Solution:**
- Check internet connection
- Verify Supabase project is active
- Check API key is correct in `lib/supabase.ts`

### Migration is slow

**Solution:**
- This is normal for large datasets (393k+ lines)
- Don't interrupt the process
- Consider migrating prayers first, then GGS later

### Data already exists

**Solution:**
- Migrations use UPSERT - safe to re-run
- Data will be updated, not duplicated

### Permission errors

**Error:** `permission denied` or `RLS policy violation`

**Solution:**
- Make sure you ran the complete schema (with RLS policies)
- Check that public read access policies exist

---

## 📊 Database Statistics

After successful migration:

| Table | Approximate Rows | Size |
|-------|-----------------|------|
| holy_books | 1 | ~1 KB |
| prayers | 6 | ~5 KB |
| prayer_lines | ~50 | ~20 KB |
| bani_lines | 393,000+ | ~200 MB |

**Total Database Size:** ~200 MB

---

## 🎉 Success!

Your app now uses Supabase for all spiritual content:
- ✅ Fast queries with indexed searches
- ✅ Scalable cloud database
- ✅ No huge local data files
- ✅ Multilingual support ready
- ✅ Easy to add more languages/translations

---

## 🗑️ Optional: Clean Up

After confirming everything works, you can:

1. **Keep local data as backup** (recommended for now)
   - Keep `data/` folder for reference

2. **Or remove local data files** (later, when confident)
   ```bash
   # Don't do this yet - wait until fully tested
   rm -rf data/
   ```

---

## 📞 Support

If you encounter issues:
1. Check Supabase dashboard logs
2. Review console output during migration
3. Verify table structure in Supabase Table Editor
4. Test connection: `npm run db:test`

---

Happy migrating! 🙏✨


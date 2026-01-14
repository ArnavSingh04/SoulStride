# 🎯 Quick Start: Database Migration

Your spiritual app has been successfully configured to use Supabase PostgreSQL! 

## ⚡ Quick 3-Step Setup

### Step 1: Create Tables (2 minutes)

1. Open: https://supabase.com/dashboard/project/xehvbppisebbzwolyfxj/sql
2. Copy everything from `lib/supabase-schema.sql`
3. Paste in SQL Editor and click "Run"

### Step 2: Migrate Prayers (10 seconds)

```bash
npm run migrate:prayers
```

### Step 3: Migrate Guru Granth Sahib (15-20 minutes)

```bash
npm run migrate:ggs
```

**That's it!** Your app now uses Supabase. 🎉

---

## 📁 What Changed?

### ✅ New Files Created:

**Configuration:**
- `lib/supabase.ts` - Supabase client setup
- `lib/database.types.ts` - TypeScript types for database
- `lib/database.service.ts` - Database query functions
- `lib/supabase-schema.sql` - Database schema

**Migration Scripts:**
- `scripts/migrate-prayers.ts` - Migrate prayers data
- `scripts/migrate-ggs.ts` - Migrate Guru Granth Sahib data
- `scripts/migrate-all.ts` - Migrate everything
- `scripts/test-connection.ts` - Test database connection

**Documentation:**
- `MIGRATION_GUIDE.md` - Detailed migration guide
- `DATABASE_SETUP.md` - Database setup instructions

### 🔄 Updated Files:

**Components:**
- `components/prayer-list.tsx` - Now uses database API
- `components/guru-granth-sahib-reader.tsx` - Now uses database API

**Configuration:**
- `package.json` - Added migration scripts

### 📂 Unchanged (will be removed later):

- `data/prayers.ts` - Old local data (keep as backup for now)
- `data/guruGranthSahib.ts` - Old local data (keep as backup for now)

---

## 🚀 How to Use

### Available Commands:

```bash
# Test database connection
npm run db:test

# Migrate all data
npm run migrate:all

# Migrate prayers only
npm run migrate:prayers

# Migrate Guru Granth Sahib only
npm run migrate:ggs

# Start app
npm start
```

---

## 🏗️ Database Architecture

```
holy_books (metadata about scriptures)
    ↓
    ├── bani_lines (393k+ lines from Guru Granth Sahib)
    │   ├── punjabi text
    │   ├── english translation
    │   ├── transliteration
    │   └── page/ang info
    │
prayers (prayer metadata)
    ↓
    └── prayer_lines (lines from daily prayers)
        ├── punjabi text
        └── english translation
```

### Features:
- ✅ Full-text search
- ✅ Multi-language support
- ✅ Indexed for fast queries
- ✅ Row-level security
- ✅ Public read access

---

## 📊 Migration Progress

Track your migration:

1. **Before:** All data in local files (large, slow)
   - ❌ 393k lines in TypeScript files
   - ❌ Slow app loading
   - ❌ No search optimization

2. **After:** All data in Supabase (fast, scalable)
   - ✅ Cloud-hosted PostgreSQL
   - ✅ Instant queries
   - ✅ Full-text search
   - ✅ Ready for more languages

---

## ⚠️ Important Notes

1. **Internet Required:** App now requires internet to load content
2. **First Load:** May be slightly slower on first load (caching added)
3. **Migration Time:** GGS migration takes 15-20 minutes (be patient!)
4. **Backup:** Keep local `data/` folder until fully tested

---

## ✅ Verification Checklist

After migration, verify:

- [ ] Tables created in Supabase
- [ ] Prayers migrated (6 prayers)
- [ ] Guru Granth Sahib migrated (1430+ pages)
- [ ] App loads prayers correctly
- [ ] Search works in prayers
- [ ] GGS reader shows pages
- [ ] GGS search works
- [ ] Navigation works

---

## 🎓 What You Can Do Next

### Add More Languages:
The database is ready for Hindi, Spanish, or any language!

### Add More Content:
Easy to add new prayers or scriptures.

### Better Search:
Full-text search is already indexed.

### Analytics:
Track popular prayers or most-read pages.

---

## 📖 Full Documentation

- **Quick Start:** This file
- **Detailed Guide:** `MIGRATION_GUIDE.md`
- **Database Setup:** `DATABASE_SETUP.md`
- **Schema Details:** `lib/supabase-schema.sql`

---

## 🆘 Need Help?

### Connection Issues:
```bash
npm run db:test
```

### Migration Failed:
- Check internet connection
- Re-run the migration (safe to retry)
- Check Supabase dashboard logs

### App Not Working:
- Verify tables exist in Supabase
- Check migration completed successfully
- Look at browser/app console for errors

---

**Ready to migrate?** Start with `npm run db:test` 🚀


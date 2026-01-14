# Database Setup Instructions

## Quick Setup

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/xehvbppisebbzwolyfxj/sql
   - Click on "SQL Editor" in the sidebar

2. **Run Schema Script**
   - Copy the entire contents of `../lib/supabase-schema.sql`
   - Paste into the SQL Editor
   - Click "Run" or press Ctrl+Enter

3. **Verify Tables Created**
   - Go to "Table Editor" in Supabase
   - You should see 4 new tables:
     - holy_books
     - bani_lines
     - prayers
     - prayer_lines

4. **Run Migrations**
   ```bash
   # From the spiritual-app directory
   npm run migrate:prayers    # Takes ~10 seconds
   npm run migrate:ggs        # Takes ~15-20 minutes
   ```

## Troubleshooting

### If tables already exist
- Delete them first or add `DROP TABLE IF EXISTS` commands before CREATE TABLE

### If migration fails
- Check your internet connection
- Verify Supabase credentials in `lib/supabase.ts`
- Check Supabase dashboard for any error logs

### If data seems incorrect
- You can re-run migrations - they use UPSERT to avoid duplicates
- Check Supabase Table Editor to view the data

## Post-Setup

After successful setup:
1. The app will automatically fetch data from Supabase
2. Local data files in `/data` are no longer used
3. You can delete `/data` folder after confirming everything works


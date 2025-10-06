# Migrations

Migration files should start with the date in YYYY-MM-DD then a 3 digit number representing the migration number of that day, then a brief description of the migration. e.g.

```
2025-10-06_001_flash_card_table.sql
```

The date and migration number are only approximate and are there to ensure the migrations get run in the correct order.

If you need to execute multiple queries in one migration e.g. create a table and apply an index, put `-- split` between queries.

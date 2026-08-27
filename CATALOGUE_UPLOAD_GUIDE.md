# Books catalogue Excel upload

## Access

1. Start Django and sign in at `/admin/` with a staff/superuser account.
2. Open **Store → Products**.
3. Select **Download Excel template**.
4. Fill the `Books` sheet without changing column names. Use one row per sellable book.
5. Select **Import Excel**, upload the `.xlsx` file and submit.

The import is transactional: if any row is invalid, no products are changed. Errors identify the row and field. Matching SKUs are updated; new SKUs are created.

Use **Full replacement** only for a complete master catalogue. It deactivates active products whose SKUs are absent from the uploaded file. It does not delete products, preserving historical order records.

## Excel columns

- `book`: individual sellable title.
- `series`: catalogue grouping; use identical spelling for every book in the same series.
- `description`: optional series description.
- `digital features`: separate multiple values with `|`.
- `isbn`: required unique ISBN-10 or ISBN-13. Format the Excel cell as Text.
- `price`: whole rupees without currency symbols or commas.
- `subject`: catalogue subject used for filtering.
- `cover photo link`: optional public HTTPS URL.

The importer automatically uses ISBN as the internal SKU and generates the series URL. New books default to 100 units of stock, HSN 4901, 0.300 kg, 24 × 18 × 1 cm, public and active. Adjust these operational values later in Django Admin before launch.

Do not upload formulas for important values. Keep the file below 5 MB and use `.xlsx` format.

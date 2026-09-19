# Digital resource-link upload

1. Upload the books catalogue first so every ISBN already exists.
2. Sign in to Django Admin and open **Store → Digital resources**.
3. Select **Download resource template**.
4. Fill one row per ISBN with a student link, teacher link, or both.
5. Select **Import resource links** and upload the completed `.xlsx` file.

The workbook uses the same six columns as the supplied `Book Reference` sheet:

- `upload row` — reference only
- `book name` — reference only
- `book code` — reference only
- `isbn to paste` — the only book-mapping key
- `student resource link`
- `teacher resource link`

Only HTTPS links are accepted. Existing ISBN mappings are updated. Unknown or duplicate ISBNs produce row-specific errors, and if any row is invalid, nothing from that file is saved.

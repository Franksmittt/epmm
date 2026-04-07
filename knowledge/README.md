# Knowledge centre

Central research for **Endpoint Media Meta** client work. Sort in batches; remove duplicates and outdated notes as you go.

## Ownership context (Vuyela / Miwesu / Vaalpenskraal)

- **Vuyela Logistics** — website client (Wayne & Jaco). Not on the portal client list; folder reserved for future docs.
- **Wayne** → **Miwesu Game Farm**, **Miwesu Firewood** (separate messaging and creative, same broad audience as the sister brands).
- **Jaco** → **Vaalpenskraal Game Farm**, **Vaalpenskraal Firewood** (same idea: shared audience, distinct brand execution).

When a file mixes both families or is clearly “template for any premium wood brand”, it lives under **`industry/firewood-braai/`** until you split it.

**Past employers & legal:** Material from former roles (e.g. Global Batteries / Novex-era systems) and litigation-related docs live under **`archive/`** so you can later relocate or exclude them from active client folders without re-sorting everything.

## Folder map

| Path | What goes here |
|------|----------------|
| `clients/<slug>/wood/` | Brand-specific firewood / braai wood copy, prompts, web briefs for that client. |
| `clients/<slug>/farm/` | Game-farm-specific research (empty until you add batch). |
| `clients/absolute-offroad/` | Absolute Offroad / EFS suspension, 4×4 social, site revamp research. |
| `clients/alberton-tyre-clinic/` | Tyre stock, SEO, captions (Dunlop/Continental/Bridgestone), invoices, website research, checklists (not panel-beating — that is **Rhino**). |
| `clients/rhino-panelbeaters/` | **Rhino Panelbeaters** — panel shop / towing SEO & keyword research (separate from Alberton Tyre Clinic). |
| `clients/as-brokers/` | AS Brokers web redesign briefs. |
| `clients/maverick-painting-contractors/` | Maverick Painting — Meta ads + paint-store SEO research. |
| `clients/xsphere/` | Xsphere website redesign research (portal slug optional until added). |
| `clients/alberton-battery-mart/` | Alberton Battery Mart — company, web, social, and local lead/keyword research. |
| `industry/automotive-batteries/` | Generic battery retail, Google Ads, golf cart/scrap market, supplier lists — reusable vertical notes (not tied to one employer). |
| `industry/misc-brand-social/` | Social research for brands not yet tied to a portal slug (e.g. third-party tyre/mag brands). |
| `archive/legal-litigation/` | Court defence, **labour law & arbitration** research, dispute strategy (kept apart from day-to-day client delivery). |
| `archive/past-employers/global-batteries/` | Global Batteries / Novex-era internal extracts: DB/business analysis, forensic audit structures, SKU/spreadsheet reports, combined card overviews, and **named** legacy workbooks (e.g. battery selection guide `.xlsx`). |
| `archive/misc/` | Unrelated imports (e.g. old bank catalogues, personal learning spreadsheets) — not client or Meta exports. |
| `archive/personal/wellbeing-research/` | Personal mental-health / app / anxiety-OCD research and drafts — kept out of client folders. |
| `clients/absolute-offroad/media/` | AOR/EFS creative: JPG/PNG exports, story frames, large ad/video files (including extensionless exports). |
| `industry/firewood-braai/` | Generic product, market, sales, prompts, Afrikaans brand building — usable across Miwesu & Vaalpenskraal wood (tune per brand when executing). |
| `channels/facebook-ads/` | Meta/Facebook setup, ad plans, geo/competitor ad angles. |
| `channels/facebook-ads/data-exports/` | CSV/XLSX pulls (campaigns, ad sets, reports) — keep raw exports here. |
| `channels/facebook-ads/reports/` | Markdown or narrative performance summaries. |
| `channels/seo/` | Search strategy and SEO research (often Gauteng / firewood). |
| `web-development/` | Next.js, e-commerce, landing page technical/research docs. |
| `creative-direction/` | Cross-brand campaign aesthetics (e.g. Apple × Samsung fusion, “tech fusion” concepts). |
| `audiences/` | Targeting and psychographics (e.g. SA leisure segments). |
| `_inbox/` | Drop new unsorted `.txt` here before the next batch. |
| `_review/` | Optional: note filenames that need **in-file splitting** (one doc → Miwesu vs Vaalpenskraal extracts). |

## Portal client slugs (for future client-specific docs)

`alberton-tyre-clinic`, `rhino-panelbeaters`, `absolute-offroad`, `alberton-battery-mart`, `maverick-painting-contractors`, `xsphere`, `on-the-move-again`, `efs-suspension`, `as-brokers`

## Batch 1 (done)

All former flat `knowledge/*.txt` files were **moved whole** into the folders above (not split inside files). Near-duplicate titles like `(docx)` vs base `.txt` were kept as separate files until you merge manually.

Re-run the mover only if you reset the tree (from repo root):

`powershell -ExecutionPolicy Bypass -File scripts/organize-knowledge.ps1`

It only moves `.txt` that still sit directly under `knowledge/` (not subfolders).

## Regenerate from Word

From repo root: `npm run convert-knowledge` — outputs new `.txt` next to any future `.docx` in `knowledge/` (uses ` (docx)` suffix if the name exists).

## Batch 2 — Google Drive folder ingest (done)

Drop a folder under `knowledge/` (e.g. `drive-download-…`), then from repo root:

1. `node scripts/convert-docx-in-dir.mjs knowledge/<that-folder>` — Word → `.txt` in place.  
2. Run ingest **with the folder name** (under `knowledge/`):  
   `powershell -ExecutionPolicy Bypass -File scripts/ingest-drive-download.ps1 drive-download-20260405T132518Z-1-001`  
3. `powershell -ExecutionPolicy Bypass -File scripts/dedupe-knowledge-txt.ps1` — drop identical `.txt` copies (keeps “cleanest” path: avoids `_inbox`, `(docx)` copies when possible).

If you add new filename→folder mappings after an ingest, run **`powershell -ExecutionPolicy Bypass -File scripts/refile-inbox.ps1`** to clear stragglers from `_inbox`.

After ingest, **`.docx` under `knowledge/` are removed** again (text is canonical). Generic **`.csv` / `.xlsx`** still go to `channels/facebook-ads/data-exports/` unless the ingest script maps them by name (e.g. Global Batteries workbook → `archive/…`, FNB → `archive/misc/`, platform test sheets → `web-development/`).

Large **JSON** exports without extensions were renamed to `.json` and filed under `clients/miwesu/farm/`.

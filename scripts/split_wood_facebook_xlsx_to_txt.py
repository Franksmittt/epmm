"""
Split Facebook Ads Excel exports into two UTF-8 text files:
  - Miwesu Premium Fire Wood
  - Vaalpenskraal Wood (incl. VPK naming)

Reads all .xlsx under 01a/ (four known exports) and writes to repo root.
Run: python scripts/split_wood_facebook_xlsx_to_txt.py
"""
from __future__ import annotations

import re
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
DIR_01A = ROOT / "01a"
OUT_MIWESU = ROOT / "Miwesu-Fire-Wood-Facebook-ads-campaigns.txt"
OUT_VAAL = ROOT / "Vaalpenskraal-Wood-Facebook-ads-campaigns.txt"

_VPK = re.compile(r"\bvpk\b", re.IGNORECASE)


def _cell_str(v: object) -> str:
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return ""
    return str(v).strip()


def row_blob(row: pd.Series) -> str:
    return " ".join(_cell_str(v) for v in row.values).lower()


def classify_from_campaign_name(campaign: str) -> str | None:
    s = _cell_str(campaign).lower()
    if not s or s == "nan":
        return None
    if "miwesu" in s:
        return "miwesu"
    if "vaalpenskraal" in s or _VPK.search(s):
        return "vaalpenskraal"
    if s.startswith("post:") and "bulk" in s and "braai" in s:
        return "vaalpenskraal"
    return None


def classify_creative_row(row: pd.Series) -> str | None:
    b = row_blob(row)
    if not b:
        return None
    if "miwesu" in b:
        return "miwesu"
    if "vaalpenskraal" in b or _VPK.search(b):
        return "vaalpenskraal"
    return None


def df_to_tsv_block(df: pd.DataFrame) -> str:
    if df.empty:
        return "(no rows)\n"
    return df.to_csv(sep="\t", index=False, lineterminator="\n")


def append_file(path: Path, text: str) -> None:
    with path.open("a", encoding="utf-8") as f:
        f.write(text)


def main() -> None:
    generated = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    header_m = (
        "MIWESU PREMIUM FIRE WOOD — Facebook Ads exports (tabular)\n"
        f"Generated: {generated}\n"
        "Split rule: any row containing “Miwesu” in campaign / page / ad / ad set text.\n"
        "Sources: 01a/Frank-Smit-Campaigns-*.xlsx (campaign summary rows), "
        "01a/Untitled-report-Mar-17-2023-to-Apr-17-2026 (1).xlsx (creative breakdown), "
        "plus any other 01a xlsx rows matching Miwesu.\n"
        "Columns are tab-separated (TSV). NaN exported as empty.\n"
        + "=" * 80
        + "\n\n"
    )
    header_v = (
        "VAALPENSKRAAL WOOD (Braai Mix / VPK) — Facebook Ads exports (tabular)\n"
        f"Generated: {generated}\n"
        "Split rule: “Vaalpenskraal”, or word VPK, in row text; "
        "and not classified as Miwesu. Anonymous “Post: … BULK BRAAI …” "
        "campaign rows are treated as Vaalpenskraal (same creative as prefixed row).\n"
        "Sources: 01a/Frank-Smit-*, 01a/Untitled-report-*.xlsx, "
        "01a/Vaalpenskraal_Wood-Campaigns-*.xlsx.\n"
        "Columns are tab-separated (TSV).\n"
        + "=" * 80
        + "\n\n"
    )

    OUT_MIWESU.write_text(header_m, encoding="utf-8")
    OUT_VAAL.write_text(header_v, encoding="utf-8")

    xlsx_files = sorted(DIR_01A.glob("*.xlsx"))
    for xlsx in xlsx_files:
        if xlsx.name.startswith("_"):
            continue
        xl = pd.ExcelFile(xlsx)
        for sheet in xl.sheet_names:
            # dtype=str + keep_default_na=False preserves Meta IDs (18 digits) in text.
            df = pd.read_excel(
                xlsx, sheet_name=sheet, dtype=str, keep_default_na=False,
            )
            if df.empty:
                continue

            # Frank-style campaign table: "Campaign name" column
            if "Campaign name" in df.columns:
                camp_col = "Campaign name"
                m_mask = df[camp_col].map(
                    lambda x: classify_from_campaign_name(_cell_str(x)) == "miwesu",
                )
                v_mask = df[camp_col].map(
                    lambda x: classify_from_campaign_name(_cell_str(x))
                    == "vaalpenskraal",
                )
                # Creative exports: also split by full row when campaign cell is NaN
                neither = (~m_mask) & (~v_mask)
                if neither.any():
                    for idx in df[neither].index:
                        r = df.loc[idx]
                        cb = classify_creative_row(r)
                        if cb == "miwesu":
                            m_mask.loc[idx] = True
                        elif cb == "vaalpenskraal":
                            v_mask.loc[idx] = True
            else:
                m_mask = pd.Series(False, index=df.index)
                v_mask = pd.Series(False, index=df.index)

            # If no campaign column, classify whole sheet by row blob
            if "Campaign name" not in df.columns:
                m_mask = df.apply(
                    lambda r: classify_creative_row(r) == "miwesu", axis=1,
                )
                v_mask = df.apply(
                    lambda r: classify_creative_row(r) == "vaalpenskraal", axis=1,
                )

            block_h = f"\n--- {xlsx.name} :: {sheet} ---\n"
            # If a row ever matched both, count it under Miwesu only.
            dm = df[m_mask].copy()
            dv = df[v_mask & ~m_mask].copy()

            if not dm.empty:
                append_file(OUT_MIWESU, block_h + df_to_tsv_block(dm))
            if not dv.empty:
                append_file(OUT_VAAL, block_h + df_to_tsv_block(dv))

    append_file(
        OUT_MIWESU,
        "\n--- End of Miwesu file (rows with no Miwesu marker appear only under Vaalpenskraal) ---\n",
    )
    append_file(
        OUT_VAAL,
        "\n--- End of Vaalpenskraal file ---\n",
    )

    print("Wrote:", OUT_MIWESU)
    print("Wrote:", OUT_VAAL)


if __name__ == "__main__":
    main()

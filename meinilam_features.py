import numpy as np
import pandas as pd

FACTORS = {
    "sqm": 1.0,
    "sqft": 0.09290304,
    "acre": 4046.8564224,
    "hectare": 10000.0,
}

PAIRS = {
    "jurisdiction_diff": ("revenue_jurisdiction", "deed_jurisdiction"),
    "survey_diff": ("revenue_survey_no", "deed_survey_no"),
    "subdivision_diff": ("revenue_subdivision", "deed_subdivision"),
    "party_diff": ("revenue_party_tag", "deed_party_tag"),
}

NUMERIC = [
    "revenue_extent", "deed_extent", "revenue_year", "deed_year",
    "history_link_present", "ec_required_years", "ec_covered_years",
    "unreadable_fields", "missing_required_documents",
    "fmb_area_sqm", "fmb_geometry_sufficient",
]

REQUIRED = sorted(
    {c for pair in PAIRS.values() for c in pair}
    | set(NUMERIC)
    | {"revenue_unit", "deed_unit"}
)

def features(df):
    missing = sorted(set(REQUIRED) - set(df.columns))
    if missing:
        raise ValueError(f"Missing input columns: {missing}")

    x = pd.DataFrame(index=df.index)

    for name, (a, b) in PAIRS.items():
        av = df[a].fillna("").astype(str)
        bv = df[b].fillna("").astype(str)
        x[name] = np.where(
            (av == "") | (bv == ""),
            np.nan,
            (av != bv).astype(float),
        )

    n = df[NUMERIC].apply(pd.to_numeric, errors="coerce")

    r = n.revenue_extent * df.revenue_unit.map(FACTORS)
    d = n.deed_extent * df.deed_unit.map(FACTORS)

    x["units_missing"] = (r.isna() | d.isna()).astype(int)
    x["extent_relative_difference"] = (d-r).abs() / r.where(r > 0)
    x["effective_year_difference"] = n.deed_year - n.revenue_year
    x["history_link_present"] = n.history_link_present

    x["ec_shortfall_years"] = (
        n.ec_required_years - n.ec_covered_years
    ).clip(lower=0)

    x["unreadable_fields"] = n.unreadable_fields
    x["missing_required_documents"] = n.missing_required_documents
    x["fmb_geometry_sufficient"] = n.fmb_geometry_sufficient

    x["fmb_relative_difference"] = (
        (n.fmb_area_sqm-r).abs() / r.where(r > 0)
    ).where(n.fmb_geometry_sufficient == 1)

    return x.replace([np.inf, -np.inf], np.nan).astype(float)

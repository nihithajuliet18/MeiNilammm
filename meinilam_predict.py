import numpy as np
import pandas as pd
from catboost import Pool
from meinilam_features import features

def explain_case(model, record):
    """Accept one structured record, not a PDF or image."""
    x = features(pd.DataFrame([record]))

    if x.columns.tolist() != list(model.feature_names_):
        raise ValueError("Feature schema differs from the trained model.")

    probabilities = model.predict_proba(x)[0]
    k = int(np.argmax(probabilities))

    values = np.asarray(
        model.get_feature_importance(
            Pool(x), type="ShapValues", thread_count=2
        )
    )

    expected = (1, len(model.classes_), x.shape[1] + 1)
    if values.shape != expected:
        raise ValueError(f"Unexpected SHAP shape: {values.shape}")

    shap_values = values[0, k, :-1]
    baseline = float(values[0, k, -1])
    raw_score = float(
        np.asarray(
            model.predict(x, prediction_type="RawFormulaVal")
        )[0, k]
    )

    if not np.isclose(
        baseline + shap_values.sum(), raw_score,
        atol=1e-5, rtol=1e-5,
    ):
        raise ValueError("SHAP additivity check failed.")

    drivers = []
    for name, value, contribution in zip(
        x.columns, x.iloc[0], shap_values
    ):
        drivers.append({
            "feature": name,
            "value": None if pd.isna(value) else float(value),
            "shap_raw_score": float(contribution),
        })

    drivers.sort(key=lambda d: abs(d["shap_raw_score"]), reverse=True)

    return {
        "predicted_class": str(model.classes_[k]),
        "uncalibrated_model_probability": float(probabilities[k]),
        "baseline_raw_score": baseline,
        "predicted_raw_score": raw_score,
        "top_model_drivers": drivers[:5],
        "unavailable_features": x.columns[x.iloc[0].isna()].tolist(),
        "scope": "Synthetic tabular prototype; human review required.",
    }

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from database import engine

from pydantic import BaseModel
import pandas as pd
import joblib
import numpy as np


# ============================================================
# App
# ============================================================

app = FastAPI(
    title="Network KPI & Tickets API",
    description="API for network KPI, ticket data, analytics, and ML predictions",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Root
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Network API is running"
    }


# ============================================================
# Health
# ============================================================

@app.get("/health")
def health():

    try:

        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as e:

        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }


# ============================================================
# Tickets
# ============================================================

@app.get("/tickets")
def get_tickets(
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0)
):

    query = text("""
        SELECT
            "SITE_ID",
            "CREATE_DATE",
            "PROBLEM_DETAIL_GROUP",
            "RESOLUTION",
            "RESOLUTION_CATEGORY",
            "TICKET_STATUS"
        FROM tickets
        ORDER BY "CREATE_DATE"
        LIMIT :limit
        OFFSET :offset
    """)

    with engine.connect() as connection:

        result = connection.execute(
            query,
            {
                "limit": limit,
                "offset": offset
            }
        )

        tickets = [
            dict(row._mapping)
            for row in result
        ]

    return {
        "count": len(tickets),
        "limit": limit,
        "offset": offset,
        "data": tickets
    }


# ============================================================
# KPI Data
# ============================================================

@app.get("/kpis")
def get_kpis(
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    site: str | None = None
):

    if site:

        query = text("""
            SELECT
                "KPI_DATETIME",
                "SITE",
                "EUTRANCELL_NAME",
                "USID",
                "BH_HPCCE_UTIL",
                "DL_TP_KBPS",
                "DL_VOLUME_GBYTE",
                "DATA_ACC_FAIL_PCT",
                "DATA_DCR_NUM",
                "DATA_DCR_PCT",
                "VOLTE_ACC_FAIL_PCT",
                "VOLTE_DCR_PCT_WORRE",
                "VOLTE_DROP_NUM_WORRE",
                "UL_RSSI_DB",
                "DUAC_NUM",
                "INTERF_HO_SR_PCT",
                "INTRAF_HO_SR_PCT",
                "RRC_CONN_MAX"
            FROM kpis
            WHERE "SITE" = :site
            ORDER BY "KPI_DATETIME"
            LIMIT :limit
            OFFSET :offset
        """)

        params = {
            "site": site,
            "limit": limit,
            "offset": offset
        }

    else:

        query = text("""
            SELECT
                "KPI_DATETIME",
                "SITE",
                "EUTRANCELL_NAME",
                "USID",
                "BH_HPCCE_UTIL",
                "DL_TP_KBPS",
                "DL_VOLUME_GBYTE",
                "DATA_ACC_FAIL_PCT",
                "DATA_DCR_NUM",
                "DATA_DCR_PCT",
                "VOLTE_ACC_FAIL_PCT",
                "VOLTE_DCR_PCT_WORRE",
                "VOLTE_DROP_NUM_WORRE",
                "UL_RSSI_DB",
                "DUAC_NUM",
                "INTERF_HO_SR_PCT",
                "INTRAF_HO_SR_PCT",
                "RRC_CONN_MAX"
            FROM kpis
            ORDER BY "KPI_DATETIME"
            LIMIT :limit
            OFFSET :offset
        """)

        params = {
            "limit": limit,
            "offset": offset
        }

    with engine.connect() as connection:

        result = connection.execute(
            query,
            params
        )

        kpis = [
            dict(row._mapping)
            for row in result
        ]

    return {
        "count": len(kpis),
        "limit": limit,
        "offset": offset,
        "site": site,
        "data": kpis
    }


# ============================================================
# Sites
# ============================================================

@app.get("/sites")
def get_sites():

    query = text("""
        SELECT DISTINCT "SITE"
        FROM kpis
        WHERE "SITE" IS NOT NULL
        ORDER BY "SITE"
    """)

    with engine.connect() as connection:

        result = connection.execute(query)

        sites = [
            row[0]
            for row in result
        ]

    return {
        "count": len(sites),
        "data": sites
    }


# ============================================================
# Dashboard Summary
# ============================================================

@app.get("/dashboard/summary")
def dashboard_summary():

    ticket_summary_query = text("""
        SELECT
            COUNT(*) AS total_tickets,
            COUNT(DISTINCT "SITE_ID") AS total_sites
        FROM tickets
    """)

    resolution_query = text("""
        SELECT
            "RESOLUTION_CATEGORY",
            COUNT(*) AS ticket_count
        FROM tickets
        GROUP BY "RESOLUTION_CATEGORY"
        ORDER BY ticket_count DESC
    """)

    status_query = text("""
        SELECT
            "TICKET_STATUS",
            COUNT(*) AS ticket_count
        FROM tickets
        GROUP BY "TICKET_STATUS"
        ORDER BY ticket_count DESC
    """)

    problem_query = text("""
        SELECT
            "PROBLEM_DETAIL_GROUP",
            COUNT(*) AS ticket_count
        FROM tickets
        GROUP BY "PROBLEM_DETAIL_GROUP"
        ORDER BY ticket_count DESC
    """)

    kpi_summary_query = text("""
        SELECT
            COUNT(*) AS total_kpi_records,
            COUNT(DISTINCT "SITE") AS total_kpi_sites,
            MIN("KPI_DATETIME") AS first_kpi_date,
            MAX("KPI_DATETIME") AS last_kpi_date,

            AVG("BH_HPCCE_UTIL") AS avg_bh_hpcce_util,
            AVG("DL_TP_KBPS") AS avg_dl_tp_kbps,
            AVG("DL_VOLUME_GBYTE") AS avg_dl_volume_gbyte,
            AVG("DATA_ACC_FAIL_PCT") AS avg_data_acc_fail_pct,
            AVG("DATA_DCR_PCT") AS avg_data_dcr_pct,
            AVG("VOLTE_ACC_FAIL_PCT") AS avg_volte_acc_fail_pct,
            AVG("VOLTE_DCR_PCT_WORRE") AS avg_volte_dcr_pct_worre,
            AVG("UL_RSSI_DB") AS avg_ul_rssi_db,
            AVG("INTERF_HO_SR_PCT") AS avg_interf_ho_sr_pct,
            AVG("INTRAF_HO_SR_PCT") AS avg_intraf_ho_sr_pct,
            AVG("RRC_CONN_MAX") AS avg_rrc_conn_max

        FROM kpis
    """)

    with engine.connect() as connection:

        ticket_summary = connection.execute(
            ticket_summary_query
        ).mappings().first()

        resolution_result = connection.execute(
            resolution_query
        ).mappings().all()

        status_result = connection.execute(
            status_query
        ).mappings().all()

        problem_result = connection.execute(
            problem_query
        ).mappings().all()

        kpi_summary = connection.execute(
            kpi_summary_query
        ).mappings().first()

    return {

        "tickets": {

            "total_tickets": ticket_summary["total_tickets"],

            "total_sites": ticket_summary["total_sites"],

            "by_resolution_category": [
                dict(row)
                for row in resolution_result
            ],

            "by_status": [
                dict(row)
                for row in status_result
            ],

            "by_problem_group": [
                dict(row)
                for row in problem_result
            ]
        },

        "kpis": {

            "total_records":
                kpi_summary["total_kpi_records"],

            "total_sites":
                kpi_summary["total_kpi_sites"],

            "first_date":
                kpi_summary["first_kpi_date"],

            "last_date":
                kpi_summary["last_kpi_date"],

            "averages": {

                "bh_hpcce_util":
                    kpi_summary["avg_bh_hpcce_util"],

                "dl_tp_kbps":
                    kpi_summary["avg_dl_tp_kbps"],

                "dl_volume_gbyte":
                    kpi_summary["avg_dl_volume_gbyte"],

                "data_acc_fail_pct":
                    kpi_summary["avg_data_acc_fail_pct"],

                "data_dcr_pct":
                    kpi_summary["avg_data_dcr_pct"],

                "volte_acc_fail_pct":
                    kpi_summary["avg_volte_acc_fail_pct"],

                "volte_dcr_pct_worre":
                    kpi_summary["avg_volte_dcr_pct_worre"],

                "ul_rssi_db":
                    kpi_summary["avg_ul_rssi_db"],

                "interf_ho_sr_pct":
                    kpi_summary["avg_interf_ho_sr_pct"],

                "intraf_ho_sr_pct":
                    kpi_summary["avg_intraf_ho_sr_pct"],

                "rrc_conn_max":
                    kpi_summary["avg_rrc_conn_max"]
            }
        }
    }


# ============================================================
# Analytics - KPI Trend
# ============================================================

@app.get("/analytics/kpi-trend")
def kpi_trend(
    kpi: str = Query(default="dl_tp_kbps")
):

    allowed_kpis = {

        "dl_tp_kbps":
            "DL_TP_KBPS",

        "bh_hpcce_util":
            "BH_HPCCE_UTIL",

        "data_dcr_pct":
            "DATA_DCR_PCT",

        "volte_dcr_pct_worre":
            "VOLTE_DCR_PCT_WORRE",

        "ul_rssi_db":
            "UL_RSSI_DB",

        "data_acc_fail_pct":
            "DATA_ACC_FAIL_PCT",

        "volte_acc_fail_pct":
            "VOLTE_ACC_FAIL_PCT",

        "rrc_conn_max":
            "RRC_CONN_MAX"
    }

    if kpi not in allowed_kpis:

        return {
            "error": "Invalid KPI",
            "allowed_kpis": list(
                allowed_kpis.keys()
            )
        }

    column = allowed_kpis[kpi]

    query = text(f"""
        SELECT
            DATE("KPI_DATETIME") AS date,
            AVG("{column}") AS value
        FROM kpis
        WHERE "{column}" IS NOT NULL
        GROUP BY DATE("KPI_DATETIME")
        ORDER BY date
    """)

    with engine.connect() as connection:

        result = connection.execute(query)

        data = []

        for row in result:

            data.append({
                "date": row.date,
                "value": float(row.value)
            })

    return {
        "kpi": kpi,
        "data": data
    }


# ============================================================
# Analytics - KPI Correlation
# ============================================================

@app.get("/analytics/kpi-correlation")
def kpi_correlation():

    query = text("""
        SELECT

            CORR(
                "BH_HPCCE_UTIL",
                "DL_TP_KBPS"
            ) AS hpcce_dl_tp,

            CORR(
                "BH_HPCCE_UTIL",
                "DATA_DCR_PCT"
            ) AS hpcce_data_dcr,

            CORR(
                "BH_HPCCE_UTIL",
                "VOLTE_DCR_PCT_WORRE"
            ) AS hpcce_volte_dcr,

            CORR(
                "BH_HPCCE_UTIL",
                "UL_RSSI_DB"
            ) AS hpcce_rssi,

            CORR(
                "DL_TP_KBPS",
                "DATA_DCR_PCT"
            ) AS dl_tp_data_dcr,

            CORR(
                "DL_TP_KBPS",
                "VOLTE_DCR_PCT_WORRE"
            ) AS dl_tp_volte_dcr,

            CORR(
                "DL_TP_KBPS",
                "UL_RSSI_DB"
            ) AS dl_tp_rssi,

            CORR(
                "DATA_DCR_PCT",
                "VOLTE_DCR_PCT_WORRE"
            ) AS data_dcr_volte_dcr,

            CORR(
                "DATA_DCR_PCT",
                "UL_RSSI_DB"
            ) AS data_dcr_rssi,

            CORR(
                "VOLTE_DCR_PCT_WORRE",
                "UL_RSSI_DB"
            ) AS volte_dcr_rssi

        FROM kpis
    """)

    with engine.connect() as connection:

        row = connection.execute(
            query
        ).mappings().first()

    def safe_float(value):

        if value is None:
            return None

        return float(value)

    matrix = {

        "bh_hpcce_util": {

            "bh_hpcce_util": 1.0,

            "dl_tp_kbps":
                safe_float(row["hpcce_dl_tp"]),

            "data_dcr_pct":
                safe_float(row["hpcce_data_dcr"]),

            "volte_dcr_pct_worre":
                safe_float(row["hpcce_volte_dcr"]),

            "ul_rssi_db":
                safe_float(row["hpcce_rssi"])
        },

        "dl_tp_kbps": {

            "bh_hpcce_util":
                safe_float(row["hpcce_dl_tp"]),

            "dl_tp_kbps": 1.0,

            "data_dcr_pct":
                safe_float(row["dl_tp_data_dcr"]),

            "volte_dcr_pct_worre":
                safe_float(row["dl_tp_volte_dcr"]),

            "ul_rssi_db":
                safe_float(row["dl_tp_rssi"])
        },

        "data_dcr_pct": {

            "bh_hpcce_util":
                safe_float(row["hpcce_data_dcr"]),

            "dl_tp_kbps":
                safe_float(row["dl_tp_data_dcr"]),

            "data_dcr_pct": 1.0,

            "volte_dcr_pct_worre":
                safe_float(row["data_dcr_volte_dcr"]),

            "ul_rssi_db":
                safe_float(row["data_dcr_rssi"])
        },

        "volte_dcr_pct_worre": {

            "bh_hpcce_util":
                safe_float(row["hpcce_volte_dcr"]),

            "dl_tp_kbps":
                safe_float(row["dl_tp_volte_dcr"]),

            "data_dcr_pct":
                safe_float(row["data_dcr_volte_dcr"]),

            "volte_dcr_pct_worre": 1.0,

            "ul_rssi_db":
                safe_float(row["volte_dcr_rssi"])
        },

        "ul_rssi_db": {

            "bh_hpcce_util":
                safe_float(row["hpcce_rssi"]),

            "dl_tp_kbps":
                safe_float(row["dl_tp_rssi"]),

            "data_dcr_pct":
                safe_float(row["data_dcr_rssi"]),

            "volte_dcr_pct_worre":
                safe_float(row["volte_dcr_rssi"]),

            "ul_rssi_db": 1.0
        }
    }

    return {
        "matrix": matrix
    }


# ============================================================
# Analytics - Problem vs Resolution
# ============================================================

@app.get("/analytics/problem-resolution")
def problem_resolution():

    query = text("""
        SELECT
            "PROBLEM_DETAIL_GROUP",
            "RESOLUTION_CATEGORY",
            COUNT(*) AS ticket_count,

            ROUND(
                COUNT(*) * 100.0
                / SUM(COUNT(*)) OVER (
                    PARTITION BY "PROBLEM_DETAIL_GROUP"
                ),
                2
            ) AS percentage

        FROM tickets

        WHERE
            "PROBLEM_DETAIL_GROUP" IS NOT NULL
            AND "RESOLUTION_CATEGORY" IS NOT NULL

        GROUP BY
            "PROBLEM_DETAIL_GROUP",
            "RESOLUTION_CATEGORY"

        ORDER BY
            "PROBLEM_DETAIL_GROUP",
            ticket_count DESC
    """)

    with engine.connect() as connection:

        result = connection.execute(query)

        data = []

        for row in result:

            data.append({

                "problem_group":
                    row.PROBLEM_DETAIL_GROUP,

                "resolution_category":
                    row.RESOLUTION_CATEGORY,

                "ticket_count":
                    int(row.ticket_count),

                "percentage":
                    float(row.percentage)
            })

    return {
        "data": data
    }


# ============================================================
# ML MODEL
# ============================================================

model = joblib.load(
    "trial_2_random_forest_model.joblib"
)


# ============================================================
# Print Model Information
# ============================================================

print("\n====================================")
print("LOADED MODEL")
print("====================================")

print("Model type:")
print(type(model))

if hasattr(model, "named_steps"):

    print("\nPipeline steps:")

    for name, step in model.named_steps.items():

        print(
            f"{name}: {type(step)}"
        )

if hasattr(model, "feature_importances_"):

    print(
        "\nModel has feature_importances_: YES"
    )

else:

    print(
        "\nModel has feature_importances_: NO"
    )


# ============================================================
# Prediction Request
# ============================================================

class PredictionRequest(BaseModel):

    USID: int

    BH_HPCCE_UTIL: float

    DL_TP_KBPS: float

    DL_VOLUME_GBYTE: float

    DATA_ACC_FAILPCT: float

    DATA_DCRNUM: float

    DATA_DCRPCT: float

    VOLTE_ACC_FAILPCT: float

    VOLTE_DCRPCT_WORRE: float

    VOLTE_DROPNUM_WORRE: float

    UL_RSSI_DB: float

    DUACNUM: float

    INTERF_HO_SRPCT: float

    INTRAF_HO_SRPCT: float

    RRCCONNMAX: float


# ============================================================
# Prediction
# ============================================================

@app.post("/predict")
def predict(request: PredictionRequest):

    try:

        # ====================================================
        # Request data
        # ====================================================

        data = request.model_dump()


        # ====================================================
        # Create DataFrame
        #
        # These names MUST match the model's training columns.
        # ====================================================

        X = pd.DataFrame([{

            "USID":
                data["USID"],

            "BH_HPCCE_UTIL":
                data["BH_HPCCE_UTIL"],

            "DL_TP_(KBPS)":
                data["DL_TP_KBPS"],

            "DL_VOLUME_(GBYTE)":
                data["DL_VOLUME_GBYTE"],

            "DATA_ACC_FAILPCT":
                data["DATA_ACC_FAILPCT"],

            "DATA_DCRNUM":
                data["DATA_DCRNUM"],

            "DATA_DCRPCT":
                data["DATA_DCRPCT"],

            "VOLTE_ACC_FAILPCT":
                data["VOLTE_ACC_FAILPCT"],

            "VOLTE_DCRPCT_(WORRE)":
                data["VOLTE_DCRPCT_WORRE"],

            "VOLTE_DROPNUM_(WORRE)":
                data["VOLTE_DROPNUM_WORRE"],

            "UL_RSSI_(DB)":
                data["UL_RSSI_DB"],

            "DUACNUM":
                data["DUACNUM"],

            "INTERF_HO_SRPCT":
                data["INTERF_HO_SRPCT"],

            "INTRAF_HO_SRPCT":
                data["INTRAF_HO_SRPCT"],

            "RRCCONNMAX":
                data["RRCCONNMAX"]

        }])


        # ====================================================
        # Debug
        # ====================================================

        print("\n====================================")
        print("MODEL INPUT")
        print("====================================")

        print(X)

        print("\nMODEL INPUT COLUMNS:")
        print(X.columns.tolist())


        if hasattr(model, "feature_names_in_"):

            print("\nMODEL EXPECTED COLUMNS:")

            print(
                model.feature_names_in_.tolist()
            )


        # ====================================================
        # Prediction
        # ====================================================

        prediction = model.predict(X)[0]


        # ====================================================
        # Class Probabilities
        # ====================================================

        class_probabilities = {}

        confidence = None

        if hasattr(model, "predict_proba"):

            probabilities = model.predict_proba(X)[0]

            classes = model.classes_

            class_probabilities = {

                str(cls): float(prob)

                for cls, prob in zip(
                    classes,
                    probabilities
                )
            }

            confidence = float(
                np.max(probabilities)
            )


        # ====================================================
        # Feature Importance
        # ====================================================

        feature_importance = {}

        try:

            # ------------------------------------------------
            # Case 1:
            # Random Forest is loaded directly
            # ------------------------------------------------

            if hasattr(
                model,
                "feature_importances_"
            ):

                print(
                    "\nRandom Forest loaded directly."
                )

                rf_model = model

                importances = (
                    rf_model.feature_importances_
                )

                feature_names = (
                    X.columns.tolist()
                )


            # ------------------------------------------------
            # Case 2:
            # Random Forest is inside Pipeline
            # ------------------------------------------------

            elif hasattr(
                model,
                "named_steps"
            ):

                print(
                    "\nMODEL IS A PIPELINE"
                )

                print(
                    "Pipeline steps:",
                    model.named_steps.keys()
                )

                # Get final model
                rf_model = model.steps[-1][1]

                print(
                    "Final model:",
                    type(rf_model)
                )

                if not hasattr(
                    rf_model,
                    "feature_importances_"
                ):

                    raise ValueError(
                        "Final pipeline step does not "
                        "have feature_importances_."
                    )

                importances = (
                    rf_model.feature_importances_
                )


                # --------------------------------------------
                # Get feature names after preprocessing
                # --------------------------------------------

                if len(model.steps) > 1:

                    preprocessor = (
                        model.steps[0][1]
                    )

                    print(
                        "Preprocessor:",
                        type(preprocessor)
                    )

                    try:

                        feature_names = (
                            preprocessor
                            .get_feature_names_out()
                        )

                    except Exception as e:

                        print(
                            "Could not get transformed "
                            "feature names:"
                        )

                        print(str(e))

                        feature_names = (
                            X.columns.tolist()
                        )

                else:

                    feature_names = (
                        X.columns.tolist()
                    )


            # ------------------------------------------------
            # Unsupported model
            # ------------------------------------------------

            else:

                raise ValueError(
                    "Loaded model does not expose "
                    "feature_importances_."
                )


            # ------------------------------------------------
            # Convert to list
            # ------------------------------------------------

            feature_names = list(
                feature_names
            )


            # ------------------------------------------------
            # Safety check
            # ------------------------------------------------

            if len(feature_names) != len(
                importances
            ):

                print(
                    "\nWARNING:"
                    " Feature name count does not "
                    "match importance count."
                )

                print(
                    "Feature names:",
                    len(feature_names)
                )

                print(
                    "Importances:",
                    len(importances)
                )

                feature_names = [

                    f"feature_{i}"

                    for i in range(
                        len(importances)
                    )
                ]


            # ------------------------------------------------
            # Build dictionary
            # ------------------------------------------------

            feature_importance = {

                str(feature):
                    float(importance)

                for feature, importance
                in zip(
                    feature_names,
                    importances
                )
            }


        except Exception as e:

            print(
                "\n===================================="
            )

            print(
                "FEATURE IMPORTANCE ERROR"
            )

            print(
                "===================================="
            )

            print(str(e))

            feature_importance = {}


        # ====================================================
        # Sort Feature Importance
        # ====================================================

        feature_importance = dict(

            sorted(
                feature_importance.items(),
                key=lambda x: x[1],
                reverse=True
            )

        )


        # ====================================================
        # Top 5 Features
        # ====================================================

        top_features = [

            {
                "feature": feature,
                "importance": importance
            }

            for feature, importance
            in list(
                feature_importance.items()
            )[:5]
        ]


        # ====================================================
        # Print Feature Importance
        # ====================================================

        print(
            "\n===================================="
        )

        print(
            "FEATURE IMPORTANCE"
        )

        print(
            "===================================="
        )

        for feature, importance in (
            feature_importance.items()
        ):

            print(
                f"{feature}: "
                f"{importance:.6f}"
            )


        print(
            "\nTOP 5 FEATURES:"
        )

        print(
            top_features
        )


        # ====================================================
        # Return Result
        # ====================================================

        return {

            "usid":
                data["USID"],

            "prediction":
                str(prediction),

            "confidence":
                confidence,

            "class_probabilities":
                class_probabilities,

            "feature_importance":
                feature_importance,

            "top_features":
                top_features
        }


    except Exception as e:

        print(
            "\n===================================="
        )

        print(
            "PREDICTION ERROR"
        )

        print(
            "===================================="
        )

        print(str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
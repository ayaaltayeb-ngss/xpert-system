import pandas as pd
from sqlalchemy import create_engine
from io import StringIO
import time

# ============================================================
# PostgreSQL connection
# ============================================================

DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5432/network_db"

engine = create_engine(DATABASE_URL)

print("Testing PostgreSQL connection...")

with engine.connect() as conn:
    print("PostgreSQL connection successful!")


# ============================================================
# File paths
# ============================================================

TICKETS_FILE = "../data/new Tickets.xlsx"
KPI_FILE = "../data/new KPIs_14 to 31 OCT processing.xlsx"


# ============================================================
# 1. TICKETS
# ============================================================

print("\n================================")
print("1. LOADING TICKETS")
print("================================")

tickets_df = pd.read_excel(TICKETS_FILE)

tickets_df = tickets_df.rename(columns={
    "CREATE_DATE_FMT": "CREATE_DATE",
    "PROBLEM DETAIL (group)": "PROBLEM_DETAIL_GROUP"
})

print(f"Tickets rows: {len(tickets_df):,}")

# Create empty table
tickets_df.head(0).to_sql(
    "tickets",
    engine,
    if_exists="replace",
    index=False
)

# Load tickets
tickets_buffer = StringIO()

tickets_df.to_csv(
    tickets_buffer,
    index=False,
    header=False
)

tickets_buffer.seek(0)

raw_connection = engine.raw_connection()

try:
    cursor = raw_connection.cursor()

    cursor.copy_expert(
        "COPY tickets FROM STDIN WITH CSV",
        tickets_buffer
    )

    raw_connection.commit()

finally:
    cursor.close()
    raw_connection.close()

print("✓ Tickets loaded successfully")


# ============================================================
# 2. READ KPIs
# ============================================================

print("\n================================")
print("2. READING KPI EXCEL FILE")
print("================================")

start_time = time.time()

print("Reading Excel...")
print("This may take a few minutes...")

kpi_df = pd.read_excel(KPI_FILE)

read_time = time.time() - start_time

print(f"✓ Excel loaded in {read_time:.1f} seconds")
print(f"KPI rows: {len(kpi_df):,}")
print(f"KPI columns: {len(kpi_df.columns)}")


# ============================================================
# 3. RENAME KPI COLUMNS
# ============================================================

print("\n================================")
print("3. PREPARING KPI DATA")
print("================================")

kpi_column_mapping = {
    "Month, Day, Year of Datetimelocal": "KPI_DATETIME",
    "Site": "SITE",
    "EUTRANCELL_NAME": "EUTRANCELL_NAME",
    "Usid": "USID",
    "BH_HPCCE_UTIL": "BH_HPCCE_UTIL",
    "DL_TP (Kbps)": "DL_TP_KBPS",
    "DL_Volume (GByte)": "DL_VOLUME_GBYTE",
    "Data_ACC_Fail%": "DATA_ACC_FAIL_PCT",
    "Data_DCR#": "DATA_DCR_NUM",
    "Data_DCR%": "DATA_DCR_PCT",
    "Volte_ACC_Fail%": "VOLTE_ACC_FAIL_PCT",
    "Volte_DCR% (woRRE)": "VOLTE_DCR_PCT_WORRE",
    "Volte_Drop# (woRRE)": "VOLTE_DROP_NUM_WORRE",
    "UL_RSSI (dB)": "UL_RSSI_DB",
    "DUAC#": "DUAC_NUM",
    "INTERF_HO_SR%": "INTERF_HO_SR_PCT",
    "INTRAF_HO_SR%": "INTRAF_HO_SR_PCT",
    "RrcConnMax": "RRC_CONN_MAX"
}

kpi_df = kpi_df.rename(columns=kpi_column_mapping)

# Convert datetime
kpi_df["KPI_DATETIME"] = pd.to_datetime(
    kpi_df["KPI_DATETIME"],
    errors="coerce"
)

invalid_dates = kpi_df["KPI_DATETIME"].isna().sum()

print(f"Invalid dates: {invalid_dates:,}")


# ============================================================
# 4. CREATE EMPTY KPI TABLE
# ============================================================

print("\nCreating PostgreSQL KPI table...")

kpi_df.head(0).to_sql(
    "kpis",
    engine,
    if_exists="replace",
    index=False
)

print("✓ Table created")


# ============================================================
# 5. LOAD KPIs IN CHUNKS
# ============================================================

print("\n================================")
print("4. LOADING KPIs")
print("================================")

total_rows = len(kpi_df)

CHUNK_SIZE = 50_000

print(f"Total rows : {total_rows:,}")
print(f"Chunk size : {CHUNK_SIZE:,}")
print(f"Chunks     : {(total_rows + CHUNK_SIZE - 1) // CHUNK_SIZE}")
print()

load_start = time.time()

for start in range(0, total_rows, CHUNK_SIZE):

    end = min(start + CHUNK_SIZE, total_rows)

    chunk = kpi_df.iloc[start:end]

    # Convert chunk to CSV
    buffer = StringIO()

    chunk.to_csv(
        buffer,
        index=False,
        header=False,
        na_rep=""
    )

    buffer.seek(0)

    # PostgreSQL connection
    raw_connection = engine.raw_connection()

    try:
        cursor = raw_connection.cursor()

        cursor.copy_expert(
            "COPY kpis FROM STDIN WITH CSV",
            buffer
        )

        raw_connection.commit()

    finally:
        cursor.close()
        raw_connection.close()

    # Progress
    processed = end
    percentage = (processed / total_rows) * 100

    elapsed = time.time() - load_start

    if processed > 0:
        rows_per_second = processed / elapsed
        remaining_rows = total_rows - processed

        if rows_per_second > 0:
            remaining_seconds = remaining_rows / rows_per_second
        else:
            remaining_seconds = 0
    else:
        remaining_seconds = 0

    minutes_remaining = remaining_seconds / 60

    print(
        f"Progress: {processed:,}/{total_rows:,} "
        f"({percentage:6.2f}%) | "
        f"Elapsed: {elapsed/60:.1f} min | "
        f"ETA: {minutes_remaining:.1f} min"
    )


# ============================================================
# 6. FINISHED
# ============================================================

total_time = time.time() - load_start

print("\n================================")
print("DATA LOADING COMPLETED")
print("================================")

print(f"Tickets: {len(tickets_df):,}")
print(f"KPIs:    {len(kpi_df):,}")

print(f"Loading time: {total_time/60:.2f} minutes")
import { useState } from "react";
import {
  BrainCircuit,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

const initialForm = {
  USID: 701,
  BH_HPCCE_UTIL: 15985.0,
  DL_TP_KBPS: 18.132867,
  DL_VOLUME_GBYTE: 6301.319444,
  DATA_ACC_FAILPCT: 133091.3125,
  DATA_DCRNUM: 0.013889,
  DATA_DCRPCT: 978.319444,
  VOLTE_ACC_FAILPCT: 0.833333,
  VOLTE_DCRPCT_WORRE: 0.0625,
  VOLTE_DROPNUM_WORRE: 1.756944,
  UL_RSSI_DB: 38.868056,
  DUACNUM: -116.590278,
  INTERF_HO_SRPCT: 0.0,
  INTRAF_HO_SRPCT: 63.826389,
  RRCCONNMAX: 96.055556,
};

function Prediction() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // Handle input change
  // ============================================================

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ============================================================
  // Run prediction
  // ============================================================

  const runPrediction = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        USID: Number(form.USID),

        BH_HPCCE_UTIL: Number(form.BH_HPCCE_UTIL),
        DL_TP_KBPS: Number(form.DL_TP_KBPS),
        DL_VOLUME_GBYTE: Number(form.DL_VOLUME_GBYTE),

        DATA_ACC_FAILPCT: Number(form.DATA_ACC_FAILPCT),
        DATA_DCRNUM: Number(form.DATA_DCRNUM),
        DATA_DCRPCT: Number(form.DATA_DCRPCT),

        VOLTE_ACC_FAILPCT: Number(form.VOLTE_ACC_FAILPCT),
        VOLTE_DCRPCT_WORRE: Number(form.VOLTE_DCRPCT_WORRE),
        VOLTE_DROPNUM_WORRE: Number(form.VOLTE_DROPNUM_WORRE),

        UL_RSSI_DB: Number(form.UL_RSSI_DB),
        DUACNUM: Number(form.DUACNUM),

        INTERF_HO_SRPCT: Number(form.INTERF_HO_SRPCT),
        INTRAF_HO_SRPCT: Number(form.INTRAF_HO_SRPCT),
        RRCCONNMAX: Number(form.RRCCONNMAX),
      };

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Prediction request failed"
        );
      }

      setResult(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to connect to the FastAPI server."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Confidence
  // ============================================================

  const confidence = result?.confidence
    ? result.confidence * 100
    : 0;

  // ============================================================
  // Class probabilities
  // ============================================================

  const classProbabilities =
    result?.class_probabilities || {};

  const probabilityEntries = Object.entries(
    classProbabilities
  ).sort((a, b) => b[1] - a[1]);

  // ============================================================
  // Feature importance
  // ============================================================

  const featureImportance =
    result?.feature_importance || {};

  const featureEntries = Object.entries(
    featureImportance
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="space-y-6">

      {/* ======================================================
          Header
      ====================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <p className="text-xs text-gray-400">
            Configure your network KPI prediction model
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-800">
            Prediction Configuration
          </h1>
        </div>

        {/* Only Run Prediction button */}
        <button
          onClick={runPrediction}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && (
            <Loader2
              size={14}
              className="animate-spin"
            />
          )}

          {loading
            ? "Running..."
            : "Run Prediction"}
        </button>

      </div>


      {/* ======================================================
          Error
      ====================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

          <AlertCircle
            size={18}
            className="mt-0.5 text-red-500"
          />

          <div>
            <p className="text-xs font-semibold text-red-700">
              Prediction Error
            </p>

            <p className="mt-1 text-xs text-red-600">
              {error}
            </p>
          </div>

        </div>
      )}


      {/* ======================================================
          Main Grid
      ====================================================== */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* ====================================================
            INPUTS
        ==================================================== */}

        <div className="xl:col-span-2">

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <SlidersHorizontal size={18} />
              </div>

              <div>

                <h2 className="text-sm font-semibold text-gray-800">
                  Model Inputs
                </h2>

                <p className="text-[10px] text-gray-400">
                  Enter the KPI values used by the Random Forest model
                </p>

              </div>

            </div>


            {/* Inputs */}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <InputField
                label="USID"
                value={form.USID}
                onChange={(value) =>
                  handleChange("USID", value)
                }
              />

              <InputField
                label="BH HPCCE Util"
                value={form.BH_HPCCE_UTIL}
                onChange={(value) =>
                  handleChange("BH_HPCCE_UTIL", value)
                }
              />

              <InputField
                label="DL TP (KBPS)"
                value={form.DL_TP_KBPS}
                onChange={(value) =>
                  handleChange("DL_TP_KBPS", value)
                }
              />

              <InputField
                label="DL Volume (GBYTE)"
                value={form.DL_VOLUME_GBYTE}
                onChange={(value) =>
                  handleChange("DL_VOLUME_GBYTE", value)
                }
              />

              <InputField
                label="Data Access Fail PCT"
                value={form.DATA_ACC_FAILPCT}
                onChange={(value) =>
                  handleChange("DATA_ACC_FAILPCT", value)
                }
              />

              <InputField
                label="Data DCR NUM"
                value={form.DATA_DCRNUM}
                onChange={(value) =>
                  handleChange("DATA_DCRNUM", value)
                }
              />

              <InputField
                label="Data DCR PCT"
                value={form.DATA_DCRPCT}
                onChange={(value) =>
                  handleChange("DATA_DCRPCT", value)
                }
              />

              <InputField
                label="VoLTE Access Fail PCT"
                value={form.VOLTE_ACC_FAILPCT}
                onChange={(value) =>
                  handleChange("VOLTE_ACC_FAILPCT", value)
                }
              />

              <InputField
                label="VoLTE DCR PCT"
                value={form.VOLTE_DCRPCT_WORRE}
                onChange={(value) =>
                  handleChange(
                    "VOLTE_DCRPCT_WORRE",
                    value
                  )
                }
              />

              <InputField
                label="VoLTE Drop NUM"
                value={form.VOLTE_DROPNUM_WORRE}
                onChange={(value) =>
                  handleChange(
                    "VOLTE_DROPNUM_WORRE",
                    value
                  )
                }
              />

              <InputField
                label="UL RSSI (DB)"
                value={form.UL_RSSI_DB}
                onChange={(value) =>
                  handleChange("UL_RSSI_DB", value)
                }
              />

              <InputField
                label="DUAC NUM"
                value={form.DUACNUM}
                onChange={(value) =>
                  handleChange("DUACNUM", value)
                }
              />

              <InputField
                label="Inter-F HO SR PCT"
                value={form.INTERF_HO_SRPCT}
                onChange={(value) =>
                  handleChange(
                    "INTERF_HO_SRPCT",
                    value
                  )
                }
              />

              <InputField
                label="Intra-F HO SR PCT"
                value={form.INTRAF_HO_SRPCT}
                onChange={(value) =>
                  handleChange(
                    "INTRAF_HO_SRPCT",
                    value
                  )
                }
              />

              <InputField
                label="RRC Conn Max"
                value={form.RRCCONNMAX}
                onChange={(value) =>
                  handleChange(
                    "RRCCONNMAX",
                    value
                  )
                }
              />

            </div>

          </div>

        </div>


        {/* ====================================================
            PREDICTION RESULT
        ==================================================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <BrainCircuit size={18} />
            </div>

            <div>

              <p className="text-[10px] text-gray-400">
                Prediction Result
              </p>

              <h2 className="text-sm font-bold text-gray-800">
                {result
                  ? result.prediction
                  : "No prediction yet"}
              </h2>

            </div>

          </div>


          {/* Result */}

          <div className="rounded-xl bg-indigo-50 p-5 text-center">

            <p className="text-xs text-gray-500">
              Model Prediction
            </p>

            <h2 className="mt-2 text-lg font-bold text-indigo-700">
              {result
                ? result.prediction
                : "Run the model"}
            </h2>


            {/* Confidence */}

            <div className="mx-auto mt-5 flex h-24 w-24 items-center justify-center rounded-full border-8 border-indigo-200">

              <span className="text-lg font-bold text-indigo-700">

                {result
                  ? `${confidence.toFixed(1)}%`
                  : "--"}

              </span>

            </div>

            <p className="mt-2 text-[10px] text-gray-400">
              Model confidence
            </p>

          </div>


          {/* Summary */}

          <div className="mt-5">

            <p className="mb-3 text-xs font-semibold text-gray-700">
              Prediction Summary
            </p>

            <div className="space-y-3">

              <SummaryRow
                label="USID"
                value={
                  result
                    ? result.usid
                    : form.USID
                }
              />

              <SummaryRow
                label="Prediction"
                value={
                  result
                    ? result.prediction
                    : "--"
                }
              />

              <SummaryRow
                label="Confidence"
                value={
                  result
                    ? `${confidence.toFixed(2)}%`
                    : "--"
                }
              />

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          CLASS PROBABILITIES
      ====================================================== */}

      {result && probabilityEntries.length > 0 && (

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <BrainCircuit size={18} />
            </div>

            <div>

              <h2 className="text-sm font-semibold text-gray-800">
                Class Probabilities
              </h2>

              <p className="text-[10px] text-gray-400">
                Probability assigned to each possible resolution
              </p>

            </div>

          </div>


          <div className="space-y-4">

            {probabilityEntries.map(
              ([label, probability]) => {

                const percentage =
                  probability * 100;

                const isPrediction =
                  label === result.prediction;

                return (
                  <div key={label}>

                    <div className="mb-1 flex items-center justify-between">

                      <span
                        className={`text-xs ${
                          isPrediction
                            ? "font-semibold text-indigo-700"
                            : "text-gray-600"
                        }`}
                      >
                        {label}
                      </span>

                      <span className="text-xs font-semibold text-gray-700">
                        {percentage.toFixed(2)}%
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">

                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>

      )}


      {/* ======================================================
          FEATURE IMPORTANCE
      ====================================================== */}

      {result && featureEntries.length > 0 && (

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <SlidersHorizontal size={18} />
            </div>

            <div>

              <h2 className="text-sm font-semibold text-gray-800">
                Feature Importance
              </h2>

              <p className="text-[10px] text-gray-400">
                Most influential features used by the Random Forest
              </p>

            </div>

          </div>


          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {featureEntries.map(
              ([feature, importance]) => {

                const maxImportance =
                  featureEntries[0][1];

                const width =
                  maxImportance > 0
                    ? (importance / maxImportance) * 100
                    : 0;

                return (
                  <div
                    key={feature}
                    className="rounded-lg border border-gray-100 p-3"
                  >

                    <div className="mb-2 flex justify-between gap-3">

                      <span className="truncate text-xs font-medium text-gray-700">
                        {formatFeatureName(feature)}
                      </span>

                      <span className="text-xs font-semibold text-indigo-600">
                        {(importance * 100).toFixed(2)}%
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">

                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{
                          width: `${width}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>

      )}

    </div>
  );
}


// ============================================================
// Input Component
// ============================================================

function InputField({
  label,
  value,
  onChange,
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-medium text-gray-600">
        {label}
      </label>

      <input
        type="number"
        step="any"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs text-gray-700 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
      />

    </div>
  );
}


// ============================================================
// Summary Row
// ============================================================

function SummaryRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-2">

      <span className="text-xs text-gray-400">
        {label}
      </span>

      <span className="max-w-[60%] truncate text-right text-xs font-semibold text-gray-700">
        {value}
      </span>

    </div>
  );
}


// ============================================================
// Format Feature Name
// ============================================================

function formatFeatureName(name) {
  return name
    .replaceAll("_", " ")
    .replaceAll("(", "")
    .replaceAll(")", "")
    .trim();
}


export default Prediction;
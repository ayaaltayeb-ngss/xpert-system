import { useEffect, useMemo, useState } from "react";

import {
  Database,
  Ticket,
  MapPin,
  Activity,
  TrendingUp,
  BarChart3,
} from "lucide-react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";


const API_URL = "http://127.0.0.1:8000";


function Analytics() {

  // ============================================================
  // STATE
  // ============================================================

  const [dashboard, setDashboard] = useState(null);

  const [kpiTrend, setKpiTrend] = useState([]);

  const [correlation, setCorrelation] = useState(null);

  const [problemResolution, setProblemResolution] =
    useState([]);

  const [selectedKPI, setSelectedKPI] =
    useState("dl_tp_kbps");

  const [selectedProblem, setSelectedProblem] =
    useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);


  // ============================================================
  // LOAD DASHBOARD
  // ============================================================

  const loadAnalytics = async () => {

    try {

      const response = await fetch(
        `${API_URL}/dashboard/summary`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load analytics data"
        );
      }

      const data = await response.json();

      setDashboard(data);

      setError(null);

    } catch (err) {

      console.error(err);

      setError(err.message);

    }

  };


  // ============================================================
  // LOAD KPI TREND
  // ============================================================

  const loadKPITrend = async () => {

    try {

      const response = await fetch(
        `${API_URL}/analytics/kpi-trend?kpi=${selectedKPI}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load KPI trend"
        );
      }

      const data = await response.json();

      setKpiTrend(data.data || []);

    } catch (err) {

      console.error(err);

    }

  };


  // ============================================================
  // LOAD CORRELATION
  // ============================================================

  const loadCorrelation = async () => {

    try {

      const response = await fetch(
        `${API_URL}/analytics/kpi-correlation`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load KPI correlation"
        );
      }

      const data = await response.json();

      setCorrelation(data);

    } catch (err) {

      console.error(err);

    }

  };


  // ============================================================
  // LOAD PROBLEM / RESOLUTION
  // ============================================================

  const loadProblemResolution = async () => {

    try {

      const response = await fetch(
        `${API_URL}/analytics/problem-resolution`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load problem resolution data"
        );
      }

      const data = await response.json();

      setProblemResolution(data.data || []);

    } catch (err) {

      console.error(err);

    }

  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {

    const loadAll = async () => {

      setLoading(true);

      await Promise.all([
        loadAnalytics(),
        loadCorrelation(),
        loadProblemResolution(),
      ]);

      setLoading(false);

    };

    loadAll();

  }, []);


  // ============================================================
  // KPI TREND
  // ============================================================

  useEffect(() => {

    loadKPITrend();

  }, [selectedKPI]);


  // ============================================================
  // PROBLEM GROUPS
  // ============================================================

  const problemGroups = useMemo(() => {

    const groups = problemResolution
      .map(
        (item) => item.problem_group
      )
      .filter(Boolean);

    return [...new Set(groups)];

  }, [problemResolution]);


  // ============================================================
  // DEFAULT PROBLEM GROUP
  // ============================================================

  useEffect(() => {

    if (
      problemGroups.length > 0 &&
      !selectedProblem
    ) {

      setSelectedProblem(
        problemGroups[0]
      );

    }

  }, [problemGroups, selectedProblem]);


  // ============================================================
  // SELECTED PROBLEM / RESOLUTION DATA
  // ============================================================

  const selectedProblemData = useMemo(() => {

    return problemResolution

      .filter(
        (item) =>
          item.problem_group === selectedProblem
      )

      .map((item) => ({
        name:
          item.resolution_category ||
          "Unknown",

        tickets:
          Number(item.ticket_count) || 0,

        percentage:
          Number(item.percentage) || 0,
      }));

  }, [
    problemResolution,
    selectedProblem,
  ]);


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <div className="flex min-h-[500px] items-center justify-center">

        <div className="text-sm text-gray-500">

          Loading analytics...

        </div>

      </div>

    );

  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error) {

    return (

      <div className="rounded-xl border border-red-200 bg-red-50 p-6">

        <h2 className="font-semibold text-red-700">

          Unable to load analytics

        </h2>

        <p className="mt-2 text-sm text-red-600">

          {error}

        </p>

      </div>

    );

  }


  if (!dashboard) {
    return null;
  }


  // ============================================================
  // RESOLUTION DATA
  // ============================================================

  const resolutionData =
    dashboard.tickets.by_resolution_category.map(
      (item) => ({

        name:
          item.RESOLUTION_CATEGORY ||
          "Unknown",

        value:
          Number(item.ticket_count) || 0,

      })
    );


  // ============================================================
  // STATUS DATA
  // ============================================================

  const statusData =
    dashboard.tickets.by_status.map(
      (item) => ({

        name:
          item.TICKET_STATUS ||
          "Unknown",

        value:
          Number(item.ticket_count) || 0,

      })
    );


  // ============================================================
  // PROBLEM GROUP DATA
  // ============================================================

  const problemData =
    dashboard.tickets.by_problem_group.map(
      (item) => ({

        name:
          item.PROBLEM_DETAIL_GROUP ||
          "Unknown",

        value:
          Number(item.ticket_count) || 0,

      })
    );


  // ============================================================
  // KPI AVERAGES
  // ============================================================

  const averages =
    dashboard.kpis.averages;


  const averageKPIData = [

    {
      name: "HPCCE",
      value: averages.bh_hpcce_util,
    },

    {
      name: "DL TP",
      value: averages.dl_tp_kbps,
    },

    {
      name: "Data DCR",
      value: averages.data_dcr_pct,
    },

    {
      name: "VoLTE DCR",
      value: averages.volte_dcr_pct_worre,
    },

    {
      name: "RSSI",
      value: averages.ul_rssi_db,
    },

  ];


  // ============================================================
  // PAGE
  // ============================================================

  return (

    <div className="space-y-6">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs text-gray-400">

            Explore network behavior, ticket patterns,
            and KPI relationships.

          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-800">

            Network Data Analytics

          </h1>

        </div>


 

      </div>


      {/* ======================================================
          DATASET OVERVIEW
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">


        <SummaryCard
          icon={<Ticket size={18} />}
          title="Total Tickets"
          value={
            dashboard.tickets.total_tickets
          }
        />


        <SummaryCard
          icon={<MapPin size={18} />}
          title="Ticket Sites"
          value={
            dashboard.tickets.total_sites
          }
        />


        <SummaryCard
          icon={<Database size={18} />}
          title="KPI Records"
          value={
            dashboard.kpis.total_records
              .toLocaleString()
          }
        />


        <SummaryCard
          icon={<Activity size={18} />}
          title="KPI Sites"
          value={
            dashboard.kpis.total_sites
          }
        />

      </div>


      {/* ======================================================
          TICKET DISTRIBUTION
      ====================================================== */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">


        {/* RESOLUTION */}

        <ChartCard
          title="Resolution Category Distribution"
          description="How historical tickets were resolved"
        >

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <BarChart
              data={resolutionData}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 90,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                angle={-25}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: 9 }}
              />

              <YAxis
                tick={{ fontSize: 10 }}
              />

              <Tooltip />

              <Bar
                dataKey="value"
                fill="#6366f1"
                radius={[5, 5, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </ChartCard>


        {/* STATUS */}

        <ChartCard
          title="Ticket Status Distribution"
          description="Status of network tickets"
        >

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <PieChart>

              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label
              >

                {statusData.map(
                  (_, index) => (
                    <Cell key={index} />
                  )
                )}

              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </ChartCard>

      </div>


      {/* ======================================================
          PROBLEM GROUP
      ====================================================== */}

      <ChartCard
        title="Problem Group Distribution"
        description="Types of network problems associated with tickets"
      >

        <ResponsiveContainer
          width="100%"
          height={380}
        >

          <BarChart
            data={problemData}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 90,
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              angle={-25}
              textAnchor="end"
              interval={0}
              tick={{ fontSize: 9 }}
            />

            <YAxis
              tick={{ fontSize: 10 }}
            />

            <Tooltip />

            <Bar
              dataKey="value"
              fill="#4f46e5"
              radius={[5, 5, 0, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </ChartCard>


      {/* ======================================================
          PROBLEM GROUP / RESOLUTION ANALYSIS
      ====================================================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">


        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>

            <h2 className="text-sm font-semibold text-gray-800">

              Problem Group and Resolution Analysis

            </h2>

            <p className="mt-1 text-[10px] text-gray-400">

              Percentage of resolution categories within each
              problem group

            </p>

          </div>


          <div className="flex items-center gap-2">

            <label className="text-xs text-gray-500">

              Problem Group

            </label>


            <select
              value={selectedProblem}
              onChange={(e) =>
                setSelectedProblem(
                  e.target.value
                )
              }
              className="max-w-[280px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 outline-none focus:border-indigo-400"
            >

              {problemGroups.map(
                (group) => (

                  <option
                    key={group}
                    value={group}
                  >

                    {group}

                  </option>

                )
              )}

            </select>

          </div>

        </div>


        {/* CHART */}

        <div className="mt-6 h-80">

          {selectedProblemData.length > 0 ? (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={selectedProblemData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 80,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 9 }}
                />

                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                  tickFormatter={
                    (value) =>
                      `${value}%`
                  }
                />

                <Tooltip
                  formatter={(
                    value,
                    name
                  ) => {

                    if (
                      name === "percentage"
                    ) {

                      return [
                        `${Number(value).toFixed(2)}%`,
                        "Percentage",
                      ];

                    }

                    return [
                      value,
                      "Tickets",
                    ];

                  }}
                />

                <Bar
                  dataKey="percentage"
                  name="percentage"
                  fill="#6366f1"
                  radius={[5, 5, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          ) : (

            <div className="flex h-full items-center justify-center text-sm text-gray-400">

              No problem-resolution data available.

            </div>

          )}

        </div>


        {/* TABLE */}

        {selectedProblemData.length > 0 && (

          <div className="mt-6 overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b border-gray-100 text-left text-[10px] uppercase tracking-wider text-gray-400">

                  <th className="px-4 py-3">
                    Resolution Category
                  </th>

                  <th className="px-4 py-3 text-right">
                    Tickets
                  </th>

                  <th className="px-4 py-3 text-right">
                    Percentage
                  </th>

                </tr>

              </thead>


              <tbody>

                {selectedProblemData.map(
                  (item) => (

                    <tr
                      key={item.name}
                      className="border-b border-gray-50 last:border-none hover:bg-gray-50"
                    >

                      <td className="px-4 py-3 text-xs text-gray-600">

                        {item.name}

                      </td>


                      <td className="px-4 py-3 text-right text-xs font-medium text-gray-700">

                        {item.tickets.toLocaleString()}

                      </td>


                      <td className="px-4 py-3 text-right">

                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-600">

                          {Number(
                            item.percentage
                          ).toFixed(2)}
                          %

                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ======================================================
          KPI OVERVIEW
      ====================================================== */}

      <ChartCard
        title="Average KPI Performance"
        description="Average network KPI values across the dataset"
      >

        <ResponsiveContainer
          width="100%"
          height={320}
        >

          <BarChart
            data={averageKPIData}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
            />

            <YAxis
              tick={{ fontSize: 10 }}
            />

            <Tooltip />

            <Bar
              dataKey="value"
              fill="#6366f1"
              radius={[5, 5, 0, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </ChartCard>


      {/* ======================================================
          KPI TREND
      ====================================================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">


        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>

            <h2 className="text-sm font-semibold text-gray-800">

              KPI Trend

            </h2>

            <p className="mt-1 text-[10px] text-gray-400">

              Daily network KPI behavior

            </p>

          </div>


          <select
            value={selectedKPI}
            onChange={(e) =>
              setSelectedKPI(
                e.target.value
              )
            }
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 outline-none"
          >

            <option value="dl_tp_kbps">
              DL Throughput
            </option>

            <option value="bh_hpcce_util">
              HPCCE Utilization
            </option>

            <option value="data_dcr_pct">
              Data DCR
            </option>

            <option value="volte_dcr_pct_worre">
              VoLTE DCR
            </option>

            <option value="ul_rssi_db">
              UL RSSI
            </option>

            <option value="data_acc_fail_pct">
              Data Access Fail
            </option>

            <option value="volte_acc_fail_pct">
              VoLTE Access Fail
            </option>

            <option value="rrc_conn_max">
              RRC Connection Max
            </option>

          </select>

        </div>


        <div className="mt-5 h-80">

          {kpiTrend.length > 0 ? (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={kpiTrend}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                />

                <YAxis
                  tick={{ fontSize: 10 }}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={false}
                />

              </LineChart>

            </ResponsiveContainer>

          ) : (

            <div className="flex h-full items-center justify-center text-sm text-gray-400">

              No trend data available.

            </div>

          )}

        </div>

      </div>


      {/* ======================================================
          KPI CORRELATION
      ====================================================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">


        <div className="mb-5">

          <h2 className="text-sm font-semibold text-gray-800">

            KPI Correlation

          </h2>

          <p className="mt-1 text-[10px] text-gray-400">

            Relationship between network performance indicators

          </p>

        </div>


        {correlation ? (

          <CorrelationTable
            correlation={correlation}
          />

        ) : (

          <div className="flex h-48 items-center justify-center text-sm text-gray-400">

            Correlation data unavailable.

          </div>

        )}

      </div>


      {/* ======================================================
          KPI STATISTICS
      ====================================================== */}

      <div>

        <div className="mb-4">

          <h2 className="text-sm font-semibold text-gray-800">

            KPI Statistics

          </h2>

          <p className="mt-1 text-[10px] text-gray-400">

            Key network performance indicators

          </p>

        </div>


        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">


          <KPICard
            title="BH HPCCE Utilization"
            value={
              averages.bh_hpcce_util
            }
          />


          <KPICard
            title="DL Throughput"
            value={
              averages.dl_tp_kbps
            }
            suffix=" Kbps"
          />


          <KPICard
            title="Data DCR"
            value={
              averages.data_dcr_pct
            }
            suffix="%"
          />


          <KPICard
            title="VoLTE DCR"
            value={
              averages.volte_dcr_pct_worre
            }
            suffix="%"
          />


          <KPICard
            title="Data Access Fail"
            value={
              averages.data_acc_fail_pct
            }
            suffix="%"
          />


          <KPICard
            title="VoLTE Access Fail"
            value={
              averages.volte_acc_fail_pct
            }
            suffix="%"
          />


          <KPICard
            title="UL RSSI"
            value={
              averages.ul_rssi_db
            }
            suffix=" dB"
          />


          <KPICard
            title="RRC Connection Max"
            value={
              averages.rrc_conn_max
            }
          />

        </div>

      </div>


      {/* ======================================================
          DATA PERIOD
      ====================================================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">


        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">

            <TrendingUp size={18} />

          </div>


          <div>

            <h2 className="text-sm font-semibold text-gray-800">

              Dataset Period

            </h2>

            <p className="text-[10px] text-gray-400">

              Period currently available in PostgreSQL

            </p>

          </div>

        </div>


        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">


          <div className="rounded-lg bg-gray-50 p-4">

            <p className="text-[10px] text-gray-400">

              First KPI Date

            </p>

            <p className="mt-1 text-sm font-semibold text-gray-700">

              {formatDate(
                dashboard.kpis.first_date
              )}

            </p>

          </div>


          <div className="rounded-lg bg-gray-50 p-4">

            <p className="text-[10px] text-gray-400">

              Last KPI Date

            </p>

            <p className="mt-1 text-sm font-semibold text-gray-700">

              {formatDate(
                dashboard.kpis.last_date
              )}

            </p>

          </div>

        </div>

      </div>


    </div>

  );

}


/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  icon,
  title,
  value,
}) {

  return (

    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">

        {icon}

      </div>


      <p className="mt-4 text-xs text-gray-400">

        {title}

      </p>


      <p className="mt-1 text-2xl font-bold text-gray-800">

        {value}

      </p>

    </div>

  );

}


/* ============================================================
   KPI CARD
============================================================ */

function KPICard({
  title,
  value,
  suffix = "",
}) {

  return (

    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

      <p className="text-xs text-gray-400">

        {title}

      </p>


      <p className="mt-2 text-xl font-bold text-gray-800">

        {value !== null &&
        value !== undefined
          ? Number(value).toFixed(2)
          : "N/A"}

        {value !== null &&
        value !== undefined
          ? suffix
          : ""}

      </p>

    </div>

  );

}


/* ============================================================
   CHART CARD
============================================================ */

function ChartCard({
  title,
  description,
  children,
}) {

  return (

    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="mb-5">

        <h2 className="text-sm font-semibold text-gray-800">

          {title}

        </h2>


        <p className="mt-1 text-[10px] text-gray-400">

          {description}

        </p>

      </div>


      {children}

    </div>

  );

}


/* ============================================================
   CORRELATION TABLE
============================================================ */

function CorrelationTable({
  correlation,
}) {

  const matrix =
    correlation.matrix ||
    correlation.data ||
    {};


  const keys =
    Object.keys(matrix);


  if (keys.length === 0) {

    return (

      <div className="py-10 text-center text-sm text-gray-400">

        No correlation data available.

      </div>

    );

  }


  return (

    <div className="overflow-x-auto">

      <table className="w-full border-collapse">

        <thead>

          <tr>

            <th className="border border-gray-100 bg-gray-50 px-3 py-3 text-left text-[10px] text-gray-500">

              KPI

            </th>


            {keys.map(
              (key) => (

                <th
                  key={key}
                  className="border border-gray-100 bg-gray-50 px-3 py-3 text-center text-[10px] text-gray-500"
                >

                  {formatKPIName(key)}

                </th>

              )
            )}

          </tr>

        </thead>


        <tbody>

          {keys.map(
            (rowKey) => (

              <tr key={rowKey}>

                <td className="border border-gray-100 bg-gray-50 px-3 py-3 text-xs font-medium text-gray-600">

                  {formatKPIName(
                    rowKey
                  )}

                </td>


                {keys.map(
                  (columnKey) => {

                    const value =
                      matrix[rowKey]?.[
                        columnKey
                      ];


                    return (

                      <td
                        key={columnKey}
                        className="border border-gray-100 px-3 py-3 text-center text-xs"
                      >

                        {value !== undefined &&
                        value !== null
                          ? Number(
                              value
                            ).toFixed(2)
                          : "-"}

                      </td>

                    );

                  }
                )}

              </tr>

            )
          )}

        </tbody>

      </table>

    </div>

  );

}


/* ============================================================
   FORMAT KPI NAME
============================================================ */

function formatKPIName(name) {

  return name
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );

}


/* ============================================================
   DATE FORMATTER
============================================================ */

function formatDate(date) {

  if (!date) {

    return "N/A";

  }


  return new Date(date).toLocaleDateString(
    "en-GB",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

}


export default Analytics;
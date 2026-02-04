<template>
  <div class="dashboard">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading dashboard data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <h3>⚠️ Error</h3>
      <p>{{ error }}</p>
      <button @click="loadDashboardData" class="retry-btn">Retry</button>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Dashboard Controls -->
      <div class="dashboard-controls">
        <div class="period-selector-wrapper">
          <button
            class="period-btn"
            @click="showPeriodSelector = !showPeriodSelector"
          >
            {{ getPeriodLabel() }}
            <span class="dropdown-arrow">▼</span>
          </button>
          <div v-if="showPeriodSelector" class="period-dropdown">
            <button
              @click="changePeriod('today')"
              :class="{ active: selectedPeriod === 'today' }"
            >
              Today
            </button>
            <button
              @click="changePeriod('yesterday')"
              :class="{ active: selectedPeriod === 'yesterday' }"
            >
              Yesterday
            </button>
            <button
              @click="changePeriod('week')"
              :class="{ active: selectedPeriod === 'week' }"
            >
              Last 7 Days
            </button>
            <button
              @click="changePeriod('month')"
              :class="{ active: selectedPeriod === 'month' }"
            >
              Last Month
            </button>
            <button
              @click="changePeriod('3months')"
              :class="{ active: selectedPeriod === '3months' }"
            >
              Last 3 Months
            </button>
            <button
              @click="changePeriod('year')"
              :class="{ active: selectedPeriod === 'year' }"
            >
              Last Year
            </button>
            <button
              @click="changePeriod('all')"
              :class="{ active: selectedPeriod === 'all' }"
            >
              All Time
            </button>
          </div>
        </div>
        <button class="control-btn" @click="loadDashboardData">
          Refresh Data
        </button>
      </div>

      <!-- Top Metrics Row -->
      <div class="top-metrics-row">
        <div class="metric-card">
          <h3># of Call Initiated</h3>
          <div class="metric-value">{{ metrics.callsInitiated }}</div>
          <div
            class="metric-change"
            :class="getChangeClass(metrics.callsInitiatedChange)"
          >
            {{ formatChange(metrics.callsInitiatedChange) }}
          </div>
        </div>
        <div class="metric-card">
          <h3>Pick Up Rate %</h3>
          <div class="metric-value">{{ metrics.pickUpRate }}%</div>
          <div
            class="metric-change"
            :class="getChangeClass(metrics.pickUpRateChange)"
          >
            {{ formatChange(metrics.pickUpRateChange) }}
          </div>
        </div>
        <div class="metric-card">
          <h3>Booking Rate %</h3>
          <div class="metric-value">{{ metrics.bookingRate }}%</div>
          <div
            class="metric-change"
            :class="getChangeClass(metrics.bookingRateChange)"
          >
            {{ formatChange(metrics.bookingRateChange) }}
          </div>
        </div>
        <div class="metric-card">
          <h3>Cost Per Booking</h3>
          <div class="metric-value">${{ metrics.costPerBooking }}</div>
          <div
            class="metric-change"
            :class="getChangeClass(metrics.costPerBookingChange)"
          >
            {{ formatChange(metrics.costPerBookingChange) }}
          </div>
        </div>
        <div class="metric-card">
          <h3>Average Cost Per Call</h3>
          <div class="metric-value">${{ metrics.avgCostPerCall }}</div>
          <div
            class="metric-change"
            :class="getChangeClass(metrics.avgCostPerCallChange)"
          >
            {{ formatChange(metrics.avgCostPerCallChange) }}
          </div>
        </div>
      </div>

      <!-- Main Dashboard Layout -->
      <div class="main-dashboard-layout">
        <!-- Side Metrics (Left Column) -->
        <div class="side-metrics">
          <div class="metric-card">
            <h3># of Calls Picked Up</h3>
            <div class="metric-value">{{ metrics.callsPickedUp }}</div>
          </div>
          <div class="metric-card">
            <h3># of Meetings Booked</h3>
            <div class="metric-value">{{ metrics.meetingsBooked }}</div>
          </div>
          <div class="metric-card">
            <h3>Money Spent</h3>
            <div class="metric-value">
              ${{ metrics.moneySpent.toLocaleString() }}
            </div>
          </div>
        </div>

        <!-- Lead Pipeline (Right Column) -->
        <div class="pipeline-section">
          <div class="pipeline-header">
            <h2>Lead Pipeline</h2>
            <button class="sort-btn" @click="refreshData">Refresh</button>
          </div>

          <!-- Show loading state -->
          <div v-if="pipelineLoading" class="pipeline-loading">
            Loading data...
          </div>

          <!-- Show pipeline bars -->
          <div v-else-if="leadPipeline.length > 0" class="pipeline-bars">
            <div
              v-for="(stage, index) in leadPipeline"
              :key="stage.name"
              class="pipeline-item"
            >
              <div class="pipeline-item-header">
                <span class="pipeline-label">{{ stage.name }}</span>
                <span class="pipeline-count">{{ stage.count }}</span>
              </div>
              <div class="pipeline-bar-bg">
                <div
                  class="pipeline-bar-fill"
                  :style="{
                    width: stage.percentage + '%',
                    backgroundColor: getStageColor(stage.name, index),
                  }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Show empty state -->
          <div v-else class="pipeline-empty">No lead stages found.</div>
        </div>
      </div>

      <!-- Call Data Table Section -->
      <div class="data-section">
        <div class="data-table-container">
          <div class="pipeline-header">
            <h2>Call Data</h2>
            <span class="record-count"
              >Showing {{ tableData.length }} of
              {{ totalCount.toLocaleString() }} records</span
            >
          </div>

          <!-- Show data as table -->
          <div v-if="tableData.length > 0" class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Call Type</th>
                  <th>Lead Stage</th>
                  <th>Picked Up</th>
                  <th>Meeting Booked</th>
                  <th>Duration</th>
                  <th>Cost</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in tableData" :key="index">
                  <td>{{ row.contact_fn || "-" }}</td>
                  <td>{{ row.contact_ln || "-" }}</td>
                  <td>{{ row.call_type || "-" }}</td>
                  <td>
                    <span
                      class="lead-stage-badge"
                      :style="{
                        backgroundColor: getStageBadgeColor(
                          row.lead_stage || '',
                        ),
                        color: '#fff',
                      }"
                    >
                      {{ row.lead_stage || "-" }}
                    </span>
                  </td>
                  <td>
                    <span :class="row.picked_up ? 'status-yes' : 'status-no'">
                      {{ row.picked_up ? "Yes" : "No" }}
                    </span>
                  </td>
                  <td>
                    <span
                      :class="
                        isMeetingBooked(row.meeting_booked)
                          ? 'status-yes'
                          : 'status-no'
                      "
                    >
                      {{ isMeetingBooked(row.meeting_booked) ? "Yes" : "No" }}
                    </span>
                  </td>
                  <td>{{ formatDuration(row.call_duration) }}</td>
                  <td>
                    ${{ (row.total_cost || row.cost_total || 0).toFixed(2) }}
                  </td>
                  <td>{{ formatDate(row.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Controls -->
          <div v-if="totalPages > 1" class="pagination">
            <button
              class="page-btn"
              @click="goToPage(1)"
              :disabled="currentPage === 1"
            >
              First
            </button>
            <button
              class="page-btn"
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
            >
              Previous
            </button>

            <span class="page-info">
              Page {{ currentPage }} of {{ totalPages }}
              <span class="total-records"
                >({{ totalCount.toLocaleString() }} total records)</span
              >
            </span>

            <button
              class="page-btn"
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
            >
              Next
            </button>
            <button
              class="page-btn"
              @click="goToPage(totalPages)"
              :disabled="currentPage === totalPages"
            >
              Last
            </button>
          </div>

          <!-- Show empty state -->
          <div v-else class="pipeline-empty">No data found in the table.</div>
        </div>
      </div>

      <!-- Charts Section -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { supabase } from "@/lib/supabase";

// Reactive data for loading states
const loading = ref(true);
const error = ref<string | null>(null);
const pipelineLoading = ref(false);

// Data from Supabase table
const tableData = ref<any[]>([]);

// Time period filter
const selectedPeriod = ref("today");
const showPeriodSelector = ref(false);

// Pagination
const currentPage = ref(1);
const pageSize = 100;
const totalCount = ref(0);

// All data for metrics (fetched separately)
const allPeriodData = ref<any[]>([]);
const previousPeriodData = ref<any[]>([]);

// Display columns - select the most useful ones for the table view
const displayColumns = [
  "contact_fn",
  "contact_ln",
  "call_type",
  "lead_stage",
  "picked_up",
  "meeting_booked",
  "call_duration",
  "total_cost",
  "created_at",
];

// Computed metrics from real data - uses ALL data from the period
const metrics = computed(() => {
  const data = allPeriodData.value;
  if (data.length === 0) {
    return {
      callsInitiated: totalCount.value, // Use totalCount even if data not fully loaded
      callsInitiatedChange: 0,
      pickUpRate: 0,
      pickUpRateChange: 0,
      bookingRate: 0,
      bookingRateChange: 0,
      costPerBooking: 0,
      costPerBookingChange: 0,
      avgCostPerCall: 0,
      avgCostPerCallChange: 0,
      callsPickedUp: 0,
      meetingsBooked: 0,
      moneySpent: 0,
    };
  }

  const totalCalls = data.length;

  // More flexible check for picked_up - handle different data types
  const pickedUp = data.filter((d) => {
    const pu = d.picked_up;
    return (
      pu === true ||
      pu === "true" ||
      pu === 1 ||
      pu === "1" ||
      pu === "yes" ||
      pu === "Yes"
    );
  }).length;

  // More flexible check for meeting_booked - handle different data types
  const meetingsBooked = data.filter((d) => {
    const mb = d.meeting_booked;
    return (
      mb === true ||
      mb === "true" ||
      mb === 1 ||
      mb === "1" ||
      mb === "yes" ||
      mb === "Yes"
    );
  }).length;

  const totalCost = data.reduce(
    (sum, d) =>
      sum + (parseFloat(d.total_cost) || parseFloat(d.cost_total) || 0),
    0,
  );

  const pickUpRate = totalCalls > 0 ? (pickedUp / totalCalls) * 100 : 0;
  const bookingRate = totalCalls > 0 ? (meetingsBooked / totalCalls) * 100 : 0;
  const avgCostPerCall = totalCalls > 0 ? totalCost / totalCalls : 0;
  const costPerBooking = meetingsBooked > 0 ? totalCost / meetingsBooked : 0;

  // Calculate changes compared to previous period
  let callsInitiatedChange = 0;
  let pickUpRateChange = 0;
  let bookingRateChange = 0;
  let costPerBookingChange = 0;
  let avgCostPerCallChange = 0;

  if (previousPeriodData.value.length > 0) {
    const prevTotalCalls = previousPeriodData.value.length;
    const prevPickedUp = previousPeriodData.value.filter((d) => {
      const pu = d.picked_up;
      return (
        pu === true ||
        pu === "true" ||
        pu === 1 ||
        pu === "1" ||
        pu === "yes" ||
        pu === "Yes"
      );
    }).length;
    const prevMeetingsBooked = previousPeriodData.value.filter((d) => {
      const mb = d.meeting_booked;
      return (
        mb === true ||
        mb === "true" ||
        mb === 1 ||
        mb === "1" ||
        mb === "yes" ||
        mb === "Yes"
      );
    }).length;
    const prevTotalCost = previousPeriodData.value.reduce(
      (sum, d) =>
        sum + (parseFloat(d.total_cost) || parseFloat(d.cost_total) || 0),
      0,
    );

    const prevPickUpRate =
      prevTotalCalls > 0 ? (prevPickedUp / prevTotalCalls) * 100 : 0;
    const prevBookingRate =
      prevTotalCalls > 0 ? (prevMeetingsBooked / prevTotalCalls) * 100 : 0;
    const prevAvgCostPerCall =
      prevTotalCalls > 0 ? prevTotalCost / prevTotalCalls : 0;
    const prevCostPerBooking =
      prevMeetingsBooked > 0 ? prevTotalCost / prevMeetingsBooked : 0;

    // Calculate percentage changes
    callsInitiatedChange =
      prevTotalCalls > 0
        ? ((totalCalls - prevTotalCalls) / prevTotalCalls) * 100
        : 0;
    pickUpRateChange = prevPickUpRate > 0 ? pickUpRate - prevPickUpRate : 0;
    bookingRateChange = prevBookingRate > 0 ? bookingRate - prevBookingRate : 0;
    avgCostPerCallChange =
      prevAvgCostPerCall > 0
        ? ((avgCostPerCall - prevAvgCostPerCall) / prevAvgCostPerCall) * 100
        : 0;
    costPerBookingChange =
      prevCostPerBooking > 0
        ? ((costPerBooking - prevCostPerBooking) / prevCostPerBooking) * 100
        : 0;
  }

  return {
    callsInitiated: totalCalls,
    callsInitiatedChange: Math.round(callsInitiatedChange * 10) / 10,
    pickUpRate: Math.round(pickUpRate * 10) / 10,
    pickUpRateChange: Math.round(pickUpRateChange * 10) / 10,
    bookingRate: Math.round(bookingRate * 10) / 10,
    bookingRateChange: Math.round(bookingRateChange * 10) / 10,
    costPerBooking: Math.round(costPerBooking * 100) / 100,
    costPerBookingChange: Math.round(costPerBookingChange * 10) / 10,
    avgCostPerCall: Math.round(avgCostPerCall * 100) / 100,
    avgCostPerCallChange: Math.round(avgCostPerCallChange * 10) / 10,
    callsPickedUp: pickedUp,
    meetingsBooked: meetingsBooked,
    moneySpent: Math.round(totalCost * 100) / 100,
  };
});

// Computed property for Lead Pipeline - groups by lead_stage and sorts by count
const leadPipeline = computed(() => {
  const data = allPeriodData.value;
  if (data.length === 0) return [];

  // Group by lead_stage and count
  const stageCounts: Record<string, number> = {};
  data.forEach((item) => {
    let stage = item.lead_stage || "Unknown";

    // Normalize similar stage names to avoid duplicates
    stage = stage.toLowerCase().replace(/[_-]/g, " ").trim();

    // Consolidate similar meeting-related stages
    if (stage.includes("meeting") && stage.includes("book")) {
      stage = "Meeting Booked";
    }

    // Capitalize first letter of each word for display
    stage = stage.replace(/\b\w/g, (l: string) => l.toUpperCase());

    stageCounts[stage] = (stageCounts[stage] || 0) + 1;
  });

  // Don't add "Has Booked Meeting" as it's likely already included in lead_stage values
  // Let's see what stages we actually have first
  console.log("Lead stages found:", Object.keys(stageCounts));

  // Convert to array and sort by count (descending)
  const stages = Object.entries(stageCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Calculate percentage based on max value
  const maxCount = stages.length > 0 && stages[0] ? stages[0].count : 1;

  return stages.map((stage) => ({
    ...stage,
    percentage: (stage.count / maxCount) * 100,
  }));
});

const timeInterval = ref("7 days");

// Methods
const changeTimeInterval = () => {
  const intervals = ["Today", "7 days", "This month", "30 days", "12 months"];
  const currentIndex = intervals.indexOf(timeInterval.value);
  const nextIndex = (currentIndex + 1) % intervals.length;
  timeInterval.value = intervals[nextIndex] || "7 days";
};

const refreshData = () => {
  loadTableData();
};

const formatDuration = (seconds: number): string => {
  if (!seconds) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper function to generate consistent colors for pipeline stages
const getStageColor = (stageName: string, index: number): string => {
  const colors = [
    "#3b82f6", // Blue
    "#8b5cf6", // Purple
    "#f59e0b", // Amber
    "#10b981", // Emerald
    "#ef4444", // Red
    "#06b6d4", // Cyan
    "#84cc16", // Lime
    "#f97316", // Orange
    "#ec4899", // Pink
    "#6366f1", // Indigo
    "#14b8a6", // Teal
    "#eab308", // Yellow
  ];

  // Use stage name hash for consistent color assignment
  const hash = stageName.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  return colors[Math.abs(hash) % colors.length] || "#3b82f6";
};

// Helper function for darker colors in table badges
const getStageBadgeColor = (stageName: string): string => {
  const colors = [
    "#1e40af", // Dark Blue
    "#5b21b6", // Dark Purple
    "#92400e", // Dark Amber
    "#065f46", // Dark Emerald
    "#991b1b", // Dark Red
    "#155e75", // Dark Cyan
    "#3f6212", // Dark Lime
    "#9a3412", // Dark Orange
    "#9d174d", // Dark Pink
    "#3730a3", // Dark Indigo
    "#115e59", // Dark Teal
    "#854d0e", // Dark Yellow
  ];

  const hash = stageName.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  return colors[Math.abs(hash) % colors.length] || "#1e40af";
};

const getLeadStageClass = (stage: string): string => {
  if (!stage) return "";
  const lowerStage = stage.toLowerCase();
  if (lowerStage.includes("booked") || lowerStage.includes("qualified"))
    return "stage-success";
  if (lowerStage.includes("dead") || lowerStage.includes("invalid"))
    return "stage-danger";
  if (lowerStage.includes("interested")) return "stage-warning";
  return "stage-default";
};

// Helper function to check if meeting is booked (handles different data types)
const isMeetingBooked = (meetingBooked: any): boolean => {
  return (
    meetingBooked === true ||
    meetingBooked === "true" ||
    meetingBooked === 1 ||
    meetingBooked === "1" ||
    meetingBooked === "yes" ||
    meetingBooked === "Yes"
  );
};

const getStageWidth = (value: number): number => {
  return 100;
};

const formatChange = (change: number): string => {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change}%`;
};

const getChangeClass = (change: number): string => {
  return change >= 0 ? "positive" : "negative";
};

// Load data from Supabase table
const loadTableData = async () => {
  try {
    pipelineLoading.value = true;

    // Calculate date filter based on selected period
    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod.value) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "yesterday":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1,
        );
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate(),
        );
        break;
      case "3months":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 3,
          now.getDate(),
        );
        break;
      case "year":
        startDate = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate(),
        );
        break;
      case "all":
      default:
        startDate = new Date(2000, 0, 1); // Very old date to get all data
        break;
    }

    const startDateStr = startDate.toISOString();

    // Calculate previous period dates for comparison
    let prevStartDate: Date;
    let prevEndDate: Date = startDate; // Previous period ends when current period starts

    const periodLength = now.getTime() - startDate.getTime();
    prevStartDate = new Date(startDate.getTime() - periodLength);

    // Handle special cases
    if (selectedPeriod.value === "all") {
      prevStartDate = new Date(2000, 0, 1); // For "all time", no meaningful comparison
      prevEndDate = new Date(2000, 0, 1);
    }

    const prevStartDateStr = prevStartDate.toISOString();
    const prevEndDateStr = prevEndDate.toISOString();

    console.log(`Period: ${selectedPeriod.value}`);
    console.log(`Current period: ${startDateStr} to ${now.toISOString()}`);
    console.log(`Previous period: ${prevStartDateStr} to ${prevEndDateStr}`);

    // First get total count for pagination
    const { count, error: countError } = await supabase
      .from("data_by_roberts")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDateStr);

    if (countError) {
      console.error("Count error:", countError);
    }

    totalCount.value = count || 0;

    // Fetch ALL data for metrics calculation (needed for accurate stats)
    // Supabase has a default limit of 1000, so we need to fetch in batches
    let allData: any[] = [];
    let batchFrom = 0;
    const batchSize = 1000;

    while (true) {
      const { data: batch, error: batchError } = await supabase
        .from("data_by_roberts")
        .select("picked_up, meeting_booked, total_cost, cost_total, lead_stage")
        .gte("created_at", startDateStr)
        .range(batchFrom, batchFrom + batchSize - 1);

      if (batchError) {
        console.error("Batch error:", batchError);
        break;
      }

      if (!batch || batch.length === 0) break;

      allData = allData.concat(batch);
      console.log(
        `Fetched batch: ${batch.length} records, total so far: ${allData.length}`,
      );

      if (batch.length < batchSize) break; // Last batch
      batchFrom += batchSize;
    }

    allPeriodData.value = allData;
    console.log(`Total records for metrics: ${allPeriodData.value.length}`);

    // Fetch previous period data for comparison (only if not "all time")
    if (selectedPeriod.value !== "all") {
      let prevData: any[] = [];
      let prevBatchFrom = 0;

      while (true) {
        const { data: prevBatch, error: prevBatchError } = await supabase
          .from("data_by_roberts")
          .select("picked_up, meeting_booked, total_cost, cost_total")
          .gte("created_at", prevStartDateStr)
          .lt("created_at", prevEndDateStr)
          .range(prevBatchFrom, prevBatchFrom + batchSize - 1);

        if (prevBatchError) {
          console.error("Previous batch error:", prevBatchError);
          break;
        }

        if (!prevBatch || prevBatch.length === 0) break;

        prevData = prevData.concat(prevBatch);

        if (prevBatch.length < batchSize) break;
        prevBatchFrom += batchSize;
      }

      previousPeriodData.value = prevData;
      console.log(
        `Previous period records: ${previousPeriodData.value.length}`,
      );
    } else {
      previousPeriodData.value = [];
    }

    // Calculate pagination range for table display
    const from = (currentPage.value - 1) * pageSize;
    const to = from + pageSize - 1;

    // Query with date filter and pagination for table
    const { data, error: fetchError } = await supabase
      .from("data_by_roberts")
      .select("*")
      .gte("created_at", startDateStr)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (fetchError) {
      console.error("Supabase error:", fetchError);
      throw fetchError;
    }

    tableData.value = data || [];
    console.log(
      `Loaded page ${currentPage.value}: ${tableData.value.length} records (Total: ${totalCount.value})`,
    );
  } catch (err: any) {
    console.error("Error loading data:", err);
    error.value = `Error: ${err.message || "Unknown error"}`;
  } finally {
    pipelineLoading.value = false;
  }
};

const changePeriod = async (period: string) => {
  selectedPeriod.value = period;
  showPeriodSelector.value = false;
  currentPage.value = 1; // Reset to first page when changing period
  await loadTableData();
};

const goToPage = async (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  await loadTableData();
};

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize));

const getPeriodLabel = () => {
  const labels: Record<string, string> = {
    today: "Today",
    yesterday: "Yesterday",
    week: "Last 7 Days",
    month: "Last Month",
    "3months": "Last 3 Months",
    year: "Last Year",
    all: "All Time",
  };
  return labels[selectedPeriod.value] || "Today";
};

// Load dashboard data
const loadDashboardData = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Load data from the table
    await loadTableData();
  } catch (err: any) {
    console.error("Error loading dashboard data:", err);
    error.value = `Failed to load data: ${err.message || "Unknown error"}`;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDashboardData();
});
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 100%;
  margin: 0 auto;
  min-height: 100vh;
  background: transparent;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  overflow-x: hidden;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  color: #e5e7eb;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.retry-btn:hover {
  background: #2563eb;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-state h3 {
  color: #f87171;
  margin-bottom: 1rem;
}

.config-help {
  background: rgba(30, 30, 30, 0.8);
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
  max-width: 600px;
  text-align: left;
  color: #e5e7eb;
}

.dashboard-controls {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 2rem;
}

.period-selector-wrapper {
  position: relative;
}

.period-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(34, 197, 94, 0.8);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.period-btn:hover {
  background: rgba(34, 197, 94, 1);
}

.dropdown-arrow {
  font-size: 0.7rem;
  margin-left: 0.25rem;
}

.period-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  background: rgba(30, 30, 30, 0.98);
  border: 1px solid rgba(75, 85, 99, 0.5);
  border-radius: 8px;
  overflow: hidden;
  z-index: 100;
  min-width: 160px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.period-dropdown button {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: #d1d5db;
  text-align: left;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.period-dropdown button:hover {
  background: rgba(55, 65, 81, 0.8);
}

.period-dropdown button.active {
  background: rgba(34, 197, 94, 0.3);
  color: #10b981;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(30, 30, 30, 0.8);
  border: 1px solid rgba(75, 85, 99, 0.5);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #e5e7eb;
  transition: all 0.2s;
}

.control-btn:hover {
  background: rgba(50, 50, 50, 0.9);
  border-color: rgba(100, 116, 139, 0.7);
}

.time-selector {
  background: rgba(30, 30, 30, 0.95);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.time-selector h3 {
  color: #f1f5f9;
  margin-bottom: 1rem;
  font-size: 1.125rem;
}

.time-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.time-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.time-option:hover {
  background: rgba(55, 65, 81, 0.5);
}

.time-option input[type="radio"] {
  accent-color: #3b82f6;
}

.time-option span {
  color: #d1d5db;
  font-size: 0.875rem;
}

.custom-date-range {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  align-items: center;
}

.date-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-input label {
  color: #e5e7eb;
  font-size: 0.875rem;
  font-weight: 500;
}

.date-input input[type="date"] {
  padding: 0.5rem;
  border: 1px solid rgba(75, 85, 99, 0.5);
  border-radius: 6px;
  background: rgba(55, 65, 81, 0.5);
  color: #d1d5db;
  font-size: 0.875rem;
}

.close-selector-btn {
  background: rgba(239, 68, 68, 0.8);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.close-selector-btn:hover {
  background: rgba(239, 68, 68, 1);
}

.top-metrics-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.main-dashboard-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.side-metrics {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metric-card {
  background: rgba(30, 30, 30, 0.8);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(75, 85, 99, 0.5);
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
}

.metric-card h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #9ca3af;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0.5rem 0;
}

.metric-change {
  font-size: 0.875rem;
  font-weight: 600;
}

.metric-change.positive {
  color: #10b981;
}

.metric-change.negative {
  color: #ef4444;
}

.pipeline-section {
  background: rgba(30, 30, 30, 0.8);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(75, 85, 99, 0.3);
}

.pipeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.pipeline-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}

.sort-btn {
  padding: 0.5rem 1rem;
  background: rgba(55, 65, 81, 0.8);
  border: 1px solid rgba(75, 85, 99, 0.5);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #e5e7eb;
  transition: background-color 0.2s;
}

.sort-btn:hover {
  background: rgba(75, 85, 99, 0.8);
}

.pipeline-loading,
.pipeline-empty {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}

/* Pipeline Bars Styles */
.pipeline-bars {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pipeline-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pipeline-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pipeline-label {
  font-size: 0.875rem;
  color: #e5e7eb;
  font-weight: 500;
}

.pipeline-count {
  font-size: 1rem;
  font-weight: 700;
  color: #f1f5f9;
}

.pipeline-bar-bg {
  height: 12px;
  background: rgba(55, 65, 81, 0.5);
  border-radius: 6px;
  overflow: hidden;
}

.pipeline-bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.5s ease;
}

/* Pipeline bars now use dynamic colors via inline styles */

.record-count {
  font-size: 0.875rem;
  color: #9ca3af;
  font-weight: 500;
}

/* Pagination Styles */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(75, 85, 99, 0.3);
}

.page-btn {
  padding: 0.5rem 1rem;
  background: rgba(55, 65, 81, 0.6);
  border: 1px solid rgba(75, 85, 99, 0.5);
  border-radius: 6px;
  color: #e5e7eb;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: rgba(75, 85, 99, 0.8);
  border-color: rgba(100, 116, 139, 0.7);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  color: #d1d5db;
  font-size: 0.875rem;
  font-weight: 500;
}

.total-records {
  color: #9ca3af;
  font-weight: 400;
}

.data-section {
  margin-top: 2rem;
}

.data-table-container {
  background: rgba(30, 30, 30, 0.8);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(75, 85, 99, 0.3);
  width: 100%;
  max-width: none;
  margin: 0 auto;
}

.data-table-wrapper {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: auto;
  width: 100%;
}

.data-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  font-size: 0.8rem;
  table-layout: fixed;
}

.data-table th,
.data-table td {
  padding: 0.75rem 0.5rem;
  vertical-align: top;
  overflow: hidden;
  text-overflow: ellipsis;
}

.data-table th:nth-child(1),
.data-table td:nth-child(1) {
  width: 9%;
} /* First Name */
.data-table th:nth-child(2),
.data-table td:nth-child(2) {
  width: 10%;
} /* Last Name */
.data-table th:nth-child(3),
.data-table td:nth-child(3) {
  width: 14%;
} /* Call Type */
.data-table th:nth-child(4),
.data-table td:nth-child(4) {
  width: 15%;
} /* Lead Stage */
.data-table th:nth-child(5),
.data-table td:nth-child(5) {
  width: 8%;
} /* Picked Up */
.data-table th:nth-child(6),
.data-table td:nth-child(6) {
  width: 12%;
} /* Meeting Booked */
.data-table th:nth-child(7),
.data-table td:nth-child(7) {
  width: 8%;
} /* Duration */
.data-table th:nth-child(8),
.data-table td:nth-child(8) {
  width: 7%;
} /* Cost */
.data-table th:nth-child(9),
.data-table td:nth-child(9) {
  width: 17%;
} /* Created At */

.data-table th {
  background: #374151;
  padding: 0.75rem 0.5rem;
  text-align: left;
  font-weight: 600;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #e5e7eb;
  border-bottom: 1px solid rgba(75, 85, 99, 0.5);
  position: sticky;
  top: 0;
  white-space: nowrap;
  overflow: hidden;
}

.data-table td {
  padding: 0.75rem;
  border-bottom: 1px solid rgba(75, 85, 99, 0.3);
  color: #d1d5db;
}

.data-table tr:hover {
  background: rgba(55, 65, 81, 0.5);
}

.status-yes {
  color: #10b981;
  font-weight: 600;
}

.status-no {
  color: #9ca3af;
}

.lead-stage-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
  display: inline-block;
  line-height: 1.3;
}

.stage-success {
  background: #065f46;
  color: #d1fae5;
  border: 1px solid #047857;
}

.stage-danger {
  background: #991b1b;
  color: #fecaca;
  border: 1px solid #b91c1c;
}

.stage-warning {
  background: #c2410c;
  color: #fed7aa;
  border: 1px solid #d97706;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stage-default {
  background: #374151;
  color: #d1d5db;
  border: 1px solid #4b5563;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.chart-container {
  background: rgba(30, 30, 30, 0.8);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(75, 85, 99, 0.3);
}

@media (max-width: 768px) {
  .main-dashboard-layout {
    grid-template-columns: 1fr;
  }

  .top-metrics-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

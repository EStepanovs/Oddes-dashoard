<template>
  <div class="about">
    <h1>Data from data_by_roberts table</h1>

    <div v-if="loading" class="loading">Loading data...</div>

    <div v-else-if="error" class="error">
      <p>Error loading data: {{ error }}</p>
    </div>

    <div v-else-if="data.length === 0" class="no-data">
      No data found in the table.
    </div>

    <div v-else class="data-container">
      <p>Found {{ data.length }} records:</p>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="column in columns" :key="column">{{ column }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in data" :key="index">
              <td v-for="column in columns" :key="column">
                {{ item[column] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { supabase } from "../lib/supabase";

const data = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const columns = computed(() => {
  if (data.value.length === 0) return [];
  return Object.keys(data.value[0]);
});

const fetchData = async () => {
  try {
    loading.value = true;
    error.value = null;

    const { data: tableData, error: fetchError } = await supabase
      .from("data_by_roberts")
      .select("*");

    if (fetchError) {
      throw fetchError;
    }

    data.value = tableData || [];
  } catch (err: any) {
    error.value = err.message || "An error occurred while fetching data";
    console.error("Error fetching data:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.about {
  min-height: 100vh;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 2rem;
  color: #374151;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #6b7280;
}

.error {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-style: italic;
}

.data-container {
  margin-top: 1rem;
}

.data-container p {
  margin-bottom: 1rem;
  font-weight: 500;
  color: #374151;
}

.table-wrapper {
  overflow-x: auto;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f9fafb;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.data-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  color: #6b7280;
}

.data-table tr:hover {
  background: #f9fafb;
}

@media (max-width: 768px) {
  .about {
    padding: 1rem;
  }

  .data-table th,
  .data-table td {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
}
</style>

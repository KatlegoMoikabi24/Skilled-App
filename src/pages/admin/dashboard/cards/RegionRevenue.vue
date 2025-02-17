<template>
  <VaCard>
    <VaCardTitle class="flex justify-between">
      <h1 class="card-title text-secondary font-bold uppercase">Revenue by Top Regions</h1>
    </VaCardTitle>
    <VaCardContent class="flex flex-col gap-1">
      <div class="flex justify-between">
        <VaButtonToggle v-model="selectedPeriod" :options="periods" color="background-element" size="small" />

        <VaButton preset="primary" size="small" @click="exportAsCSV"> Export </VaButton>
      </div>

      <VaDataTable
        class="region-revenue-table"
        :columns="[
          { key: 'name', label: 'Top Region' },
          { key: 'revenue', label: 'Revenue', align: 'right' },
        ]"
        :items="data"
      >
        <template #cell(revenue)="{ rowData }"> R {{ rowData[`revenue${selectedPeriod}`] }} </template>
      </VaDataTable>
    </VaCardContent>
  </VaCard>
</template>

<script setup lang="ts">
import { ref, Ref } from 'vue'
import { downloadAsCSV } from '../../../../services/toCSV'

const selectedPeriod = ref('Today') as Ref<'Today' | 'Week' | 'Month'>
const periods = ['Today', 'Week', 'Month'].map((period) => ({ label: period, value: period }))

const data = [
  {
    name: 'Gauteng',
    revenueToday: '4,748,454',
    revenueWeek: '30,000,000',
    revenueMonth: '120,000,000',
  },
  {
    name: 'Limpopo',
    revenueToday: '405,748',
    revenueWeek: '2,500,000',
    revenueMonth: '10,000,000',
  },
  {
    name: 'North West',
    revenueToday: '308,536',
    revenueWeek: '1,800,000',
    revenueMonth: '8,000,000',
  },
  {
    name: 'Western Cape',
    revenueToday: '250,963',
    revenueWeek: '1,600,000',
    revenueMonth: '7,000,000',
  },
  {
    name: 'Northern Cape',
    revenueToday: '29,415',
    revenueWeek: '180,000',
    revenueMonth: '800,000',
  },
  {
    name: 'Mpumalanga',
    revenueToday: '15,000',
    revenueWeek: '100,000',
    revenueMonth: '500,000',
  },
  {
    name: 'Eastern Cape',
    revenueToday: '10,000',
    revenueWeek: '50,000',
    revenueMonth: '200,000',
  },
]

const exportAsCSV = () => {
  downloadAsCSV(data, 'region-revenue')
}
</script>

<style lang="scss" scoped>
.region-revenue-table {
  ::v-deep(tbody) {
    tr {
      border-top: 1px solid var(--va-background-border);
    }
  }
}
</style>

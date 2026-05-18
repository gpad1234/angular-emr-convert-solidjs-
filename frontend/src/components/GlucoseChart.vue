<template>
  <div class="w-full h-64">
    <canvas ref="canvasRef" aria-label="Glucose chart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'

const props = defineProps({ readings: { type: Array, default: () => [] } })

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler, annotationPlugin)

const canvasRef = ref(null)
let chartInstance = null

function classify(value) {
  if (value < 70) return 'Low'
  if (value <= 180) return 'Target'
  return 'High'
}

function buildConfig(readings) {
  const labels = readings.map((r) => new Date(r.reading_datetime).toLocaleString())
  const data = readings.map((r) => Math.round(r.value_mgdl))

  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Glucose (mg/dL)',
          data,
          borderColor: '#14b8a6',
          backgroundColor: 'rgba(20,184,166,0.08)',
          fill: true,
          tension: 0.25,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: false },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => (items?.[0]?.label ?? ''),
            label: (context) => {
              const v = context.formattedValue
              const num = Number(v)
              return `${v} mg/dL — ${classify(num)}`
            },
          },
        },
        annotation: {
          annotations: {
            targetBand: {
              type: 'box',
              yMin: 70,
              yMax: 180,
              backgroundColor: 'rgba(34,197,94,0.06)',
              borderWidth: 0,
            },
            lowLine: {
              type: 'line',
              yMin: 70,
              yMax: 70,
              borderColor: 'rgba(59,130,246,0.6)',
              borderWidth: 1,
              label: { content: '70 mg/dL', enabled: true, position: 'start' },
            },
            highLine: {
              type: 'line',
              yMin: 180,
              yMax: 180,
              borderColor: 'rgba(244,63,94,0.6)',
              borderWidth: 1,
              label: { content: '180 mg/dL', enabled: true, position: 'end' },
            },
          },
        },
      },
    },
  }
}

onMounted(() => {
  if (!canvasRef.value) return
  chartInstance = new Chart(canvasRef.value.getContext('2d'), buildConfig(props.readings || []))
})

watch(
  () => props.readings,
  (newVal) => {
    if (!chartInstance) return
    chartInstance.data.labels = (newVal || []).map((r) => new Date(r.reading_datetime).toLocaleString())
    chartInstance.data.datasets[0].data = (newVal || []).map((r) => Math.round(r.value_mgdl))
    chartInstance.update()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

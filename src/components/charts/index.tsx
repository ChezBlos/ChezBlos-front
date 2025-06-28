import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

// Enregistrer les composants nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Configuration commune des graphiques
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        font: {
          family: "Gilroy, sans-serif",
          size: 12,
        },
        color: "#374151",
      },
    },
    tooltip: {
      backgroundColor: "#1f2937",
      titleColor: "#f9fafb",
      bodyColor: "#f9fafb",
      borderColor: "#f97316",
      borderWidth: 1,
      cornerRadius: 8,
      titleFont: {
        family: "Gilroy, sans-serif",
        size: 14,
        weight: 600,
      },
      bodyFont: {
        family: "Gilroy, sans-serif",
        size: 12,
      },
    },
  },
  scales: {
    x: {
      grid: {
        color: "#e5e7eb",
      },
      ticks: {
        color: "#6b7280",
        font: {
          family: "Gilroy, sans-serif",
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: "#e5e7eb",
      },
      ticks: {
        color: "#6b7280",
        font: {
          family: "Gilroy, sans-serif",
          size: 11,
        },
      },
    },
  },
};

// Composant pour graphique en barres des ventes
interface SalesBarChartProps {
  data: Array<{
    date: string;
    commandes: number;
    recettes: number;
  }>;
  title?: string;
  height?: number;
}

export const SalesBarChart: React.FC<SalesBarChartProps> = ({
  data,
  title = "Évolution des Ventes",
  height = 300,
}) => {
  const chartData = {
    labels: data.map((item) => item.date),
    datasets: [
      {
        label: "Commandes",
        data: data.map((item) => item.commandes),
        backgroundColor: "#f97316",
        borderColor: "#ea580c",
        borderWidth: 1,
        yAxisID: "y",
      },
      {
        label: "Recettes (XOF)",
        data: data.map((item) => item.recettes),
        backgroundColor: "#3b82f6",
        borderColor: "#2563eb",
        borderWidth: 1,
        yAxisID: "y1",
      },
    ],
  };
  const options = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            family: "Gilroy, sans-serif",
            size: 11,
          },
          callback: function (value: any) {
            return new Intl.NumberFormat("fr-FR").format(value) + " XOF";
          },
        },
      },
    },
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: title,
        font: {
          family: "Gilroy, sans-serif",
          size: 16,
          weight: 600,
        },
        color: "#1f2937",
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

// Composant pour graphique en ligne des tendances
interface TrendLineChartProps {
  data: Array<{
    date: string;
    value: number;
  }>;
  title?: string;
  color?: string;
  height?: number;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data,
  title = "Tendance",
  color = "#f97316",
  height = 300,
}) => {
  const chartData = {
    labels: data.map((item) => item.date),
    datasets: [
      {
        label: title,
        data: data.map((item) => item.value),
        borderColor: color,
        backgroundColor: color + "20",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: color,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
  const options = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: title,
        font: {
          family: "Gilroy, sans-serif",
          size: 16,
          weight: 600,
        },
        color: "#1f2937",
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

// Composant pour graphique en donut des modes de paiement
interface PaymentMethodChartProps {
  data: Array<{
    modePaiement: string;
    montantTotal: number;
    pourcentage: number;
  }>;
  height?: number;
}

export const PaymentMethodChart: React.FC<PaymentMethodChartProps> = ({
  data,
  height = 300,
}) => {
  const colors = [
    "#f97316", // Orange principal
    "#3b82f6", // Bleu
    "#10b981", // Vert
    "#f59e0b", // Jaune
    "#ef4444", // Rouge
    "#8b5cf6", // Violet
    "#06b6d4", // Cyan
    "#84cc16", // Lime
  ];

  const chartData = {
    labels: data.map((item) => item.modePaiement),
    datasets: [
      {
        data: data.map((item) => item.montantTotal),
        backgroundColor: colors.slice(0, data.length),
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          font: {
            family: "Gilroy, sans-serif",
            size: 12,
          },
          color: "#374151",
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#f9fafb",
        bodyColor: "#f9fafb",
        borderColor: "#f97316",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context: any) {
            const item = data[context.dataIndex];
            return `${item.modePaiement}: ${new Intl.NumberFormat(
              "fr-FR"
            ).format(item.montantTotal)} XOF (${item.pourcentage.toFixed(1)}%)`;
          },
        },
      },
      title: {
        display: true,
        text: "Répartition des Modes de Paiement",
        font: {
          family: "Gilroy, sans-serif",
          size: 16,
          weight: 600,
        },
        color: "#1f2937",
      },
    },
    cutout: "60%",
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

// Composant pour graphique comparaison
interface ComparisonChartProps {
  data: {
    period1: { label: string; commandes: number; recettes: number };
    period2: { label: string; commandes: number; recettes: number };
  };
  height?: number;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  height = 300,
}) => {
  const chartData = {
    labels: ["Commandes", "Recettes (XOF)"],
    datasets: [
      {
        label: data.period1.label,
        data: [data.period1.commandes, data.period1.recettes],
        backgroundColor: "#f97316",
        borderColor: "#ea580c",
        borderWidth: 1,
      },
      {
        label: data.period2.label,
        data: [data.period2.commandes, data.period2.recettes],
        backgroundColor: "#3b82f6",
        borderColor: "#2563eb",
        borderWidth: 1,
      },
    ],
  };
  const options = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: "Comparaison des Périodes",
        font: {
          family: "Gilroy, sans-serif",
          size: 16,
          weight: 600,
        },
        color: "#1f2937",
      },
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        ticks: {
          ...chartOptions.scales.y.ticks,
          callback: function (value: any) {
            return new Intl.NumberFormat("fr-FR").format(value);
          },
        },
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

// Composant pour diagramme circulaire des dépenses par catégorie
interface ExpenseCategoryPieChartProps {
  data: Array<{
    categorie: string;
    montant: number;
    pourcentage: number;
  }>;
  height?: number;
}

export const ExpenseCategoryPieChart: React.FC<
  ExpenseCategoryPieChartProps
> = ({ data, height = 320 }) => {
  const colors = [
    "#3b82f6", // Bleu
    "#10b981", // Vert
    "#f97316", // Orange
    "#8b5cf6", // Violet
    "#f59e0b", // Jaune
    "#ef4444", // Rouge
    "#06b6d4", // Cyan
    "#84cc16", // Lime
  ];

  const chartData = {
    labels: data.map((item) => item.categorie),
    datasets: [
      {
        data: data.map((item) => item.montant),
        backgroundColor: colors.slice(0, data.length),
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          font: {
            family: "Gilroy, sans-serif",
            size: 12,
          },
          color: "#374151",
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#f9fafb",
        bodyColor: "#f9fafb",
        borderColor: "#f97316",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context: any) {
            const item = data[context.dataIndex];
            return `${item.categorie}: ${new Intl.NumberFormat("fr-FR").format(
              item.montant
            )} XOF (${item.pourcentage.toFixed(1)}%)`;
          },
        },
      },
      title: {
        display: true,
        text: "Dépenses par Catégorie",
        font: {
          family: "Gilroy, sans-serif",
          size: 16,
          weight: 600,
        },
        color: "#1f2937",
      },
    },
    cutout: "60%",
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import {
  Chart,
  ChartConfiguration,
  registerables,
  TimeScale,
  LinearScale,
  Tooltip,
  Title,
  Legend,
} from 'chart.js';
import {
  CandlestickController,
  CandlestickElement,
} from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import dayjs from 'dayjs';

// Register all necessary components
Chart.register(
  ...registerables,
  CandlestickController,
  CandlestickElement,
  TimeScale,
  LinearScale,
  Tooltip,
  Title,
  Legend
);

// Type definition
export interface OHLCVData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class ChartService {
  private chartJSNodeCanvas: ChartJSNodeCanvas;
  private width: number;
  private height: number;

  constructor() {
    this.width = parseInt(process.env.CHART_WIDTH || '800', 10);
    this.height = parseInt(process.env.CHART_HEIGHT || '400', 10);
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({
      width: this.width,
      height: this.height,
      backgroundColour: 'white',
    });
  }

  async generateCandlestickChart(
    data: OHLCVData[],
    symbol: string,
    title?: string
  ): Promise<Buffer> {
    if (!data.length) throw new Error('No data provided for chart generation');

    const configuration: ChartConfiguration = {
      type: 'candlestick',
      data: {
        datasets: [
          {
            label: symbol,
            data: data.map(item => ({
              x: new Date(item.timestamp).getTime(),
              o: item.open,
              h: item.high,
              l: item.low,
              c: item.close,
            })),
            type: 'candlestick'
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: title || `${symbol} Candlestick Chart`,
          },
          legend: { display: false },
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
            },
            title: {
              display: true,
              text: 'Date',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Price (USD)',
            },
          },
        },
      },
    };

    return this.chartJSNodeCanvas.renderToBuffer(configuration);
  }

  async generateLineChart(
    data: OHLCVData[],
    symbol: string,
    title?: string
  ): Promise<Buffer> {
    if (!data.length) throw new Error('No data provided for chart generation');

    const labels = data.map(item =>
      dayjs(item.timestamp).format('MMM D')
    );
    const prices = data.map(item => item.close);

    const configuration: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Price',
            data: prices,
            borderColor: '#2196f3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            fill: true,
            tension: 0.1,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: title || `${symbol} Price Chart`,
          },
          legend: { display: false },
        },
        scales: {
          y: {
            title: {
              display: true,
              text: 'Price (USD)',
            },
          },
        },
      },
    };

    return this.chartJSNodeCanvas.renderToBuffer(configuration);
  }

  async generateVolumeChart(
    data: OHLCVData[],
    symbol: string
  ): Promise<Buffer> {
    if (!data.length) throw new Error('No data provided for chart generation');

    const labels = data.map(item =>
      dayjs(item.timestamp).format('MMM D')
    );
    const volumes = data.map(item => item.volume);

    const configuration: ChartConfiguration = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Volume',
            data: volumes,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: `${symbol} Volume Chart`,
          },
          legend: { display: false },
        },
        scales: {
          y: {
            title: {
              display: true,
              text: 'Volume',
            },
            ticks: {
              callback: (val: any) => {
                if (val >= 1e9) return `${val / 1e9}B`;
                if (val >= 1e6) return `${val / 1e6}M`;
                if (val >= 1e3) return `${val / 1e3}K`;
                return val;
              },
            },
          },
        },
      },
    };

    return this.chartJSNodeCanvas.renderToBuffer(configuration);
  }

  async generateComprehensiveChart(
    data: OHLCVData[],
    symbol: string,
    title?: string
  ): Promise<Buffer> {
    if (!data.length) throw new Error('No data provided for chart generation');

    const labels = data.map(item =>
      dayjs(item.timestamp).format('MMM D')
    );
    const prices = data.map(item => item.close);
    const volumes = data.map(item => item.volume);

    const configuration: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Price',
            data: prices,
            borderColor: '#2196f3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            fill: true,
            tension: 0.1,
            yAxisID: 'y',
          },
          {
            label: 'Volume',
            data: volumes,
            type: 'bar',
            backgroundColor: 'rgba(255, 152, 0, 0.3)',
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: title || `${symbol} Price & Volume`,
          },
        },
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Price (USD)',
            },
          },
          y1: {
            type: 'linear',
            position: 'right',
            title: {
              display: true,
              text: 'Volume',
            },
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              callback: (val: any) => {
                if (val >= 1e9) return `${val / 1e9}B`;
                if (val >= 1e6) return `${val / 1e6}M`;
                if (val >= 1e3) return `${val / 1e3}K`;
                return val;
              },
            },
          },
        },
      },
    };

    return this.chartJSNodeCanvas.renderToBuffer(configuration);
  }
}

// Export a singleton instance
export const chartService = new ChartService();

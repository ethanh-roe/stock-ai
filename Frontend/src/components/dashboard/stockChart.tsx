import React, { useEffect, useRef } from 'react';
import { createChart, LineSeries, ColorType } from 'lightweight-charts';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

type StockChartProps = {
  ticker: string;
  historyData: any[];
}

const StockChart: React.FC<StockChartProps> = ({ ticker, historyData }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: theme.palette.text.secondary,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 450,
      grid: {
        vertLines: { color: theme.palette.divider },
        horzLines: { color: theme.palette.divider },
      },
    });

    const lineSeries = chart.addSeries(LineSeries, {
      color: theme.palette.primary.main,
      lineWidth: 2,
    });

    chartRef.current = chart;
    seriesRef.current = lineSeries;

    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0 || !chartContainerRef.current) return;
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [ticker, theme]);

  useEffect(() => {
    if (seriesRef.current && historyData.length > 0) {
      seriesRef.current.setData(historyData);
      chartRef.current.timeScale().fitContent();
    }
  }, [historyData]);

  return (
    <Box
      ref={chartContainerRef}
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        '& .tv-lightweight-charts-logo': { display: 'none !important' },
      }}
    />
  );
};

export default StockChart;

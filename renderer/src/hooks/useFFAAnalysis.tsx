import type { LineChartProps } from "@mui/x-charts";
import type { DataGridProps } from "@mui/x-data-grid";
import type { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import BitImage from "../components/BitImage";
import type { FileWithDate } from "../models";
import { computeVesselDensityFromFile, type VesselDensityResult } from "../utils/ffa";
import dayjs from "dayjs";

interface TableRow {
  id: number;
  date: Dayjs;
  image: HTMLImageElement;
  vesselDensity: number;
  delta: number | null;
  rollingAvg: number | null;
}

interface FFAStats {
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
}

const computeFFAStats = (data: VesselDensityResult[]): FFAStats | null => {
  if (data.length === 0) return null;
  const densities = data.map(d => d.vesselDensity);
  const mean = densities.reduce((a, b) => a + b, 0) / densities.length;
  const min = Math.min(...densities);
  const max = Math.max(...densities);
  const median = densities.slice().sort((a, b) => a - b)[Math.floor(densities.length / 2)];
  const variance = densities.reduce((a, b) => a + (b - mean) ** 2, 0) / densities.length;
  const stdDev = Math.sqrt(variance);

  return { mean, median, min, max, stdDev };
}

const computeFFAData = async (files: FileWithDate[]): Promise<VesselDensityResult[]> =>
  await Promise.all(
    files
      .sort((a, b) => a.dateCaptured.valueOf() - b.dateCaptured.valueOf())
      .map(async file => await computeVesselDensityFromFile(file))
  );

const computeTableData = (data: VesselDensityResult[]): TableRow[] => {
  const rolling: number[] = [];
  return data.map((item, index) => {
    const prev = index > 0 ? data[index - 1].vesselDensity : null;
    const delta = prev !== null ? item.vesselDensity - prev : null;

    rolling.push(item.vesselDensity);
    const rollingAvg = rolling.length > 0 ? rolling.reduce((a, b) => a + b, 0) / rolling.length : null;

    return {
      id: index,
      date: item.file.dateCaptured,
      image: item.image,
      vesselDensity: Number(item.vesselDensity.toFixed(2)),
      delta: delta !== null ? Number(delta.toFixed(2)) : null,
      rollingAvg: rollingAvg !== null ? Number(rollingAvg.toFixed(2)) : null,
    };
  });
};

export function useFFAAnalysis(files: FileWithDate[]) {
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [ffaData, setFfaData] = useState<VesselDensityResult[]>([]);
  const [stats, setStats] = useState<FFAStats | null>(null);

  const lineChartProps: LineChartProps = useMemo(() => ({
    height: 300,
    dataset: ffaData.map(d => ({
      date: d.file.dateCaptured.toDate(),
      vesselDensity: d.vesselDensity
    })),
    xAxis: [{
      label: "Date",
      dataKey: "date",
      scaleType: "time", // Crucial for date axis
      valueFormatter: (date) => dayjs(date).format("MMM D"), // Optional: Format how dates appear
    },],
    series: [
      {
        dataKey: 'vesselDensity',
        label: "Vessel Density",
      },
    ],
  }), [ffaData])

  const dataGridProps: DataGridProps<TableRow> = useMemo(() => ({
    autoHeight: true,
    rowHeight: 80,
    columns: [
      { field: 'date', headerName: 'Date', width: 150, renderCell: (params) => params.value.format('YYYY-MM-DD') },
      { field: 'image', headerName: 'Image', width: 150, renderCell: (params) => <BitImage img={params.value} /> },
      { field: 'vesselDensity', headerName: 'Vessel Density', width: 150 },
      { field: 'delta', headerName: 'Δ', width: 100 },
      { field: 'rollingAvg', headerName: 'Rolling Avg', width: 150 },
    ],
    rows: tableData
  }), [tableData])

  useEffect(() => {
    if (!files || files.length === 0) return;
    const analyse = async () => {
      setIsLoading(true);
      try {
        // Compute vessel density for each file
        const results: VesselDensityResult[] = await computeFFAData(files);
        await setFfaData(results);

        // Compute statistics
        const stats: FFAStats | null = computeFFAStats(results);
        await setStats(stats);

        // Compute table data
        const tableData = computeTableData(results);
        await setTableData(tableData);
      } catch (error) {
        console.error("Error analyzing files:", error);
      } finally {
        setIsLoading(false);
      }
    }
    analyse();
  }, [files]);

  return { isLoading, lineChartProps, dataGridProps, tableData, stats };
}
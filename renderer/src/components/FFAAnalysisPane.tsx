
import { Box, Button, CircularProgress, Grid, Paper } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import { useFFAAnalysis } from "../hooks/useFFAAnalysis";
import type { FileWithDate } from "../models";

interface FFAAnalysisPaneProps {
  files: FileWithDate[];
  onUpload: () => void;
}

export const FFAAnalysisPane = ({ files, onUpload }: FFAAnalysisPaneProps) => {
  const { isLoading, lineChartProps, dataGridProps } = useFFAAnalysis(files);
  return isLoading ? (
    <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CircularProgress />
    </Box>
  ) : (
    <Grid container spacing={1} sx={{ height: '100%' }}>
      <Box sx={{ display: 'flex', position: 'absolute', top: 16, right: 16 }}>
        <Button variant="contained" size="small" onClick={onUpload}>Upload</Button>
      </Box>
      <Grid size={{
        xs: 12,
        md: 7,
      }} component={Paper} variant="outlined" sx={{ padding: '1rem' }}>
        <LineChart {...lineChartProps} />
      </Grid>
      <Grid size={{
        xs: 12,
        md: 5,
      }} component={Paper} variant="outlined" sx={{ padding: '1rem' }}>
        <DataGrid
          sx={{ height: '100%', width: '100%' }}
          {...dataGridProps}
        />
      </Grid>
    </Grid>
  )
}
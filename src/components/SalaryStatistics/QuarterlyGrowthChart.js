// import * as React from 'react';
// import Box from '@mui/material/Box';
// import Stack from '@mui/material/Stack';
// import { axisClasses } from '@mui/x-charts/ChartsAxis';
// import { BarChart } from '@mui/x-charts/BarChart';
// import { LineChart } from '@mui/x-charts/LineChart';
// import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
// import ToggleButton from '@mui/material/ToggleButton';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Switch from '@mui/material/Switch';
// import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine';
// import { LinePlot, BarPlot, ResponsiveChartContainer } from '@mui/x-charts';

// const QuarterlyGrowthChart = ({ quarterTotals, quarterChanges }) => {
//   const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
//   const [chartType, setChartType] = React.useState('bar');
//   const [withArea, setWithArea] = React.useState(false);
//   const [highlighted, setHighlighted] = React.useState('total');
//   const [faded, setFaded] = React.useState('global');
//   const handleChartType = (event, newChartType) => {
//     if (newChartType !== null) {
//       setChartType(newChartType);
//     }
//   };

//   const dataset = quarters.map((quarter, index) => {
//     return {
//       quarter,
//       total: quarterTotals[quarter] || 0,
//       change: quarterChanges[index] || 0
//     };
//   });
//   const valueFormatter = (value) => `${value}%`;
//   console.log('Total Values:', dataset);

//   const barChartsParams = {
//     dataset: dataset,
//     series: [
//       { type: 'bar', dataKey: 'total', label: 'Total', yAxisKey: 'total', color: 'skyblue' },
//       { type: 'bar', dataKey: 'change', label: 'Change', yAxisKey: 'change', valueFormatter, color: 'lightcoral' },
//     ],
//     tickPlacement: 'middle',
//     grid: { vertical: true, horizontal: true },
//     yAxis: [
//       { id: 'total', scaleType: 'linear', position: "left", label: 'Total', colorMap: {type: 'continuous', min: -100000,  color: ['skyblue', 'skyblue']}},
//       { id: 'change', scaleType: 'linear', position: "right", label: 'Percentage change', valueFormatter, colorMap: {type: 'continuous', min: -10, max: 30, color: ['lightcoral', 'lightcoral']} }
//     ],

//     leftAxis: 'total',
//     rightAxis: 'change',
//     xAxis: [{ scaleType: 'band', dataKey: 'quarter', label: 'Quarters' }],
//     height: 300,
//     margin: { left: 120, right: 100 },
//     sx: {
//       [`.${axisClasses.left} .${axisClasses.label}`]: {
//         transform: 'translate(-30px, 0)',
//       },  
//       [`.${axisClasses.right} .${axisClasses.label}`]: {
//         transform: 'translate(20px, 0)',
//       },     
//     },
//   };

//   const lineChartsParams = {
//     dataset: dataset,
//     series: [
//       { type: 'line', dataKey: 'total', label: 'Total', yAxisKey: 'total' },
//       { type: 'line', dataKey: 'change', label: 'Change', yAxisKey: 'change', valueFormatter },
//     ],
//     tickPlacement: 'start',
//     grid: { vertical: true, horizontal: true },
//     xAxis: [{ scaleType: 'band', dataKey: 'quarter', label: 'Quarters' }],
//     yAxis: [
//       { id: 'total', scaleType: 'linear', position: "left", label: 'Total' },
//       { id: 'change', scaleType: 'linear', position: "right", label: 'Percentage change', valueFormatter }
//     ],
//     leftAxis: 'total',
//     rightAxis: 'change',
//     height: 300,
//     margin: { left: 120, right: 100 },
//     sx: {
//       [`.${axisClasses.left} .${axisClasses.label}`]: {
//         transform: 'translate(-30px, 0)',
//       },   
//       [`.${axisClasses.right} .${axisClasses.label}`]: {
//         transform: 'translate(20px, 0)',
//       },    
//     },
//   };

//   return (
//     <Stack
//       direction={{ xs: 'column', xl: 'row' }}
//       spacing={1}
//       sx={{ width: '100%' }}
//       margin={{ top: 20, right: 30, bottom: 60, left: 70 }}
//     >
//       <Box sx={{ flexGrow: 1, width: '100%', maxWidth: '900px' }}>
//         <ToggleButtonGroup
//           value={chartType}
//           exclusive
//           onChange={handleChartType}
//           aria-label="chart type"
//           fullWidth
//         >
//           {['bar', 'line'].map((type) => (
//             <ToggleButton key={type} value={type} aria-label="left aligned">
//               {type}
//             </ToggleButton>
//           ))}
//         </ToggleButtonGroup>
//         {chartType === 'bar' && (
//           <BarChart
//             {...barChartsParams}
//             series={barChartsParams.series.map((series) => ({
//               ...series,
//               highlightScope: {
//                 highlighted,
//                 faded,
//               },
//             }))}
            
//           />
          
//         )}

//         {chartType === 'line' && (
//           <LineChart
//             {...lineChartsParams}
//             series={lineChartsParams.series.map((series) => ({
//               ...series,
//               area: withArea,
//               highlightScope: {
//                 highlighted,
//                 faded,
//               },
//               tickPlacement: 'start',
//             }))}
//           />
//         )}
//       </Box>
//       <Stack
//         direction={{ xs: 'row', xl: 'column' }}
//         spacing={3}
//         justifyContent="center"
//         flexWrap="wrap"
//         useFlexGap
//       >        
//         {chartType === 'line' && (
//           <FormControlLabel
//             control={
//               <Switch
//                 checked={withArea}
//                 onChange={(event) => setWithArea(event.target.checked)}
//               />
//             }
//             label="Fill line area"
//           />
//         )}
//       </Stack>
//     </Stack>
//   );
// };

// export default QuarterlyGrowthChart;
import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import {
  ResponsiveChartContainer,
  ChartsXAxis,
  ChartsYAxis,
  ChartsReferenceLine,
  LinePlot,
  BarPlot,
  ChartsLegend,
  ChartsTooltip,
  ChartsAxisHighlight,
  ChartsGrid,
} from '@mui/x-charts';

const QuarterlyGrowthChart = ({ quarterTotals, quarterChanges }) => {
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const [chartType, setChartType] = React.useState('bar');
  const [withArea, setWithArea] = React.useState(false);

  const handleChartType = (event, newChartType) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  const dataset = quarters.map((quarter, index) => ({
    quarter,
    total: quarterTotals[quarter] || 0,
    change: quarterChanges[index] || 0,
  }));

  const valueFormatter = (value) => `${value}%`;

  const xAxis = [{
    label: 'Quarters',
    data: quarters,
    scaleType: 'band',
  }];

  const yAxis = [
    { 
      id: 'total', 
      label: 'Total', 
      scaleType: 'linear', 
      position: 'left', 
      min: 0, 
      max: Math.max(...dataset.map(d => d.total)) + 10,
      labelStyle: { 
        padding: '0 -10px', 
        fontSize: '14px',
        fill: '#333'
      }
    },
    { 
      id: 'change', 
      label: 'Percentage change', 
      scaleType: 'linear', 
      position: 'right', 
      min: -10, 
      max: 10, 
      valueFormatter,
      labelStyle: { 
        padding: '0 20px',
        fontSize: '14px', 
        fill: '#333'
      }
    },
  ];

  const barSeries = [
    { type: 'bar', label: 'Total', data: dataset.map((d) => d.total), yAxisKey: 'total', color: 'skyblue', barWidth: 0.3, barGap: 0.2 },
    { type: 'bar', label: 'Change', data: dataset.map((d) => d.change), yAxisKey: 'change', valueFormatter, color: 'lightcoral', barWidth: 0.3, barGap: 0.2 },
  ];

  const lineSeries = [
    { type: 'line', label: 'Total', data: dataset.map((d) => d.total), yAxisKey: 'total' },
    { type: 'line', label: 'Change', data: dataset.map((d) => d.change), yAxisKey: 'change', valueFormatter },
  ];

  return (
    <Stack
      direction={{ xs: 'column', xl: 'row' }}
      spacing={1}
      sx={{ width: '100%' }}
      margin={{ top: 20, right: 80, bottom: 60, left: 70 }}
    >
      <Box sx={{ flexGrow: 1, width: '100%', maxWidth: '900px' }}>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartType}
          aria-label="chart type"
          fullWidth
        >
          {['bar', 'line'].map((type) => (
            <ToggleButton key={type} value={type} aria-label="left aligned">
              {type}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <ResponsiveChartContainer
          xAxis={xAxis}
          yAxis={yAxis}
          series={chartType === 'bar' ? barSeries : lineSeries}
          height={300}
          margin={{ top: 50, right: 120, left: 120 }}
          sx = {{ 
            [`.${axisClasses.left} .${axisClasses.label}`]: {
              transform: 'translate(-45px, 0)',
            },
            [`.${axisClasses.right} .${axisClasses.label}`]: {
              transform: 'translate(40px, 0)',
            },
           }}
        >
          {chartType === 'bar' && <BarPlot />}
          {chartType === 'line' && <LinePlot area={withArea} />}
          <ChartsXAxis />
          <ChartsYAxis yAxisKey="total" axisId="total" />
          <ChartsYAxis yAxisKey="change" axisId="change" position="right"  />
          <ChartsLegend />
          <ChartsTooltip trigger="axis" />
          <ChartsAxisHighlight x="line" />
          <ChartsReferenceLine
            y={0}
            label="0%"
            yAxisKey="change"
            axisId="change"
            labelAlign="end"
            lineStyle={{ stroke: 'grey', strokeDasharray: '3 3' }}
          />
          {/* <ChartsGrid horizontal axisId="change"/> */}
        </ResponsiveChartContainer>
      </Box>
      <Stack
        direction={{ xs: 'row', xl: 'column' }}
        spacing={3}
        justifyContent="center"
        flexWrap="wrap"
        useFlexGap
      >
        {chartType === 'line' && (
          <FormControlLabel
            control={
              <Switch
                checked={withArea}
                onChange={(event) => setWithArea(event.target.checked)}
              />
            }
            label="Fill line area"
          />
        )}
      </Stack>
    </Stack>
  );
};

export default QuarterlyGrowthChart;

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const QuarterlyGrowthChart = ({ quarterTotals, quarterChanges }) => {
  const data = [
    { name: 'Q1', Total: quarterTotals.Q1, Change: parseFloat(quarterChanges.Q4toQ1.replace('%', '')), },
    { name: 'Q2', Total: quarterTotals.Q2, Change: parseFloat(quarterChanges.Q1toQ2.replace('%', '')), },
    { name: 'Q3', Total: quarterTotals.Q3, Change: parseFloat(quarterChanges.Q2toQ3.replace('%', '')), },
    { name: 'Q4', Total: quarterTotals.Q4, Change: parseFloat(quarterChanges.Q3toQ4.replace('%', '')), },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 20, right: 30, left: 0, bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="Total" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line yAxisId="right" type="monotone" dataKey="Change" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default QuarterlyGrowthChart;

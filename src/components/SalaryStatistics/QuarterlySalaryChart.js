// import React from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// const QuarterlySalaryChart = ({ quarterTotals, quarterChanges }) => {
  
//   const data = [
//     {
//       name: 'Q1',
//       Total: quarterTotals.Q1,
//       Change: quarterChanges.Q4toQ1.replace('%', ''), 
//     },
//     {
//       name: 'Q2',
//       Total: quarterTotals.Q2,
//       Change: quarterChanges.Q1toQ2.replace('%', ''),
//     },
//     {
//       name: 'Q3',
//       Total: quarterTotals.Q3,
//       Change: quarterChanges.Q2toQ3.replace('%', ''),
//     },
//     {
//       name: 'Q4',
//       Total: quarterTotals.Q4,
//       Change: quarterChanges.Q3toQ4.replace('%', ''),
//     },
//   ];

//   return (
//     <ResponsiveContainer width="100%" height={300}>
//       <BarChart
//         data={data}
//         margin={{
//           top: 20,
//           right: 30,
//           left: 20,
//           bottom: 5,
//         }}
//       >
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="name" />
//         <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
//         <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
//         <Tooltip />
//         <Legend />
//         <Bar yAxisId="left" dataKey="Total" fill="#8884d8" name="Total GBP" />
//         <Bar yAxisId="right" dataKey="Change" fill="#82ca9d" name="Change %" />
//       </BarChart>
//     </ResponsiveContainer>
//   );
// };

// export default QuarterlySalaryChart;
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const QuarterlySalaryChart = ({ quarterTotals, quarterChanges }) => {
  
  const data = [
    { name: 'Q1', Total: quarterTotals.Q1, Change: quarterChanges[0] },
    { name: 'Q2', Total: quarterTotals.Q2, Change: quarterChanges[1] },
    { name: 'Q3', Total: quarterTotals.Q3, Change: quarterChanges[2] },
    { name: 'Q4', Total: quarterTotals.Q4, Change: quarterChanges[3] },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="Total" fill="#8884d8" name="Total GBP" />
        <Bar yAxisId="right" dataKey="Change" fill="#82ca9d" name="Change %" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default QuarterlySalaryChart;

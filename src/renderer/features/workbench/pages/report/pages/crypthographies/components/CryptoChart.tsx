import React from 'react';
import {
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, RadialBarChart, RadialBar, ResponsiveContainer
} from 'recharts';
import { Box, Typography } from '@mui/material';
import { getColor } from '@shared/utils/utils';


export const CryptoChart = ({data}) => {
  return (
    <>
      {data && Object.entries(data?.type || []).length > 0 ? (
        <Box sx={{pt:2.5, pb:1, mb:4, borderRadius:2, height:350, overflow: 'scroll' , display: 'flex', flexDirection: 'row', alignItems:'flex-end',  justifyContent: 'space-around', backgroundColor: 'white'}}>
            <TypeDistributionChart title={'Type report'} data={data}></TypeDistributionChart>
            <CryptoAlgorithmsPieChart title={'Type report'} data={data}></CryptoAlgorithmsPieChart>
        </Box>
      ) : (
        <Box sx={{pt: 1.5, pb:1.5, mb:4, borderRadius:2, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white'}}>
          <Typography variant="body1">No data found</Typography>
        </Box>
      )}
    </>
  )
}

// Reusable Type Distribution chart component using Recharts
export const TypeDistributionChart = ({ data, title }) => {
  // Transform data for type distribution chart
  const typeData = Object.entries(data?.type || {}).map(([key, value]) => ({
    name: key,
    value: value
  }));
  // Handle empty data states
  const hasData = typeData.length > 0;

  if (!hasData) {
    return <div className="flex h-64 items-center justify-center text-gray-500">No type data available</div>;
  }

  return (
    <ResponsiveContainer width="45%" height="100%">
      <BarChart
        barGap={1}
        barCategoryGap={2}
        cx='20%'
        data={typeData}>

        <CartesianGrid strokeDasharray="1 1" />
        <XAxis dataKey="name" />
        <YAxis
          allowDecimals={false}
        />
        <Tooltip />
        <Bar dataKey="value" fill="#6366F1" barSize={20}/>
      </BarChart>
    </ResponsiveContainer>
  );
};

export const CryptoAlgorithmsPieChart = ({ data, title }) => {
  // Transform the crypto data for the pie chart
  // Expecting data structure like: { crypto: { "md5": 1, "sha256": 3, ... } }
  const cryptoData = Object.entries(data?.crypto || {}).map(([name, value],index) => ({
    name,
    fill: getColor(index),
    value
  }));

  if (cryptoData.length === 0) {
    return <div>No cryptographic algorithm data available</div>;
  }

  return (
    <ResponsiveContainer width="50%" height="100%">
      <PieChart
      >
        <Pie
          data={cryptoData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          strokeWidth={0.5}
          dataKey="value"
        >
          {cryptoData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(index)} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [`${value}`, name]} />
        <Legend  layout='horizontal' verticalAlign='bottom' align="center"
         wrapperStyle={{
           maxHeight: '100px',
           overflow: 'auto',
           paddingBottom: '10px'
         }}
        />

      </PieChart>
    </ResponsiveContainer>
  )
};


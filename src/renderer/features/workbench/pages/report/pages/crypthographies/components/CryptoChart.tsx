import React from 'react';
import {
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis,
  CartesianGrid, Tooltip
} from 'recharts';
import { Box, Typography } from '@mui/material';
import { getColor } from '@shared/utils/utils';


export const CryptoChart = ({data}) =>{
  return (
    <>
      {data && Object.entries(data?.type || []).length > 0 ? (
        <Box sx={{pt: 1, pb:1, mb:4, borderRadius:2, display: 'flex', flexDirection: 'row', alignItems:'flex-start',  justifyContent: 'space-around', backgroundColor: 'white'}}>
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
    <div>
      <Typography sx={{pt: 0.9, pb:1.3, fontWeight:'600'}} variant='h6' color='textPrimary'>Types</Typography>
      <BarChart
        width={455}
        height={270}
        barGap={1}
        cx='20%'
        data={typeData}>

        <CartesianGrid strokeDasharray="1 1" />
        <XAxis dataKey="name" />
        <YAxis
          allowDecimals={false}
        />
        <Tooltip />
        <Bar dataKey="value" fill="#6366F1" barSize={40}/>
      </BarChart>
    </div>
  );
};



export const CryptoAlgorithmsPieChart = ({ data, title }) => {
  // Transform the crypto data for the pie chart
  // Expecting data structure like: { crypto: { "md5": 1, "sha256": 3, ... } }
  const cryptoData = Object.entries(data?.crypto || {}).map(([name, value]) => ({
    name,
    value
  }));

  if (cryptoData.length === 0) {
    return <div>No cryptographic algorithm data available</div>;
  }

  const COLORS = [
    '#FF5733', '#C70039', '#900C3F', '#581845', '#2471A3',
    '#1ABC9C', '#27AE60', '#F1C40F', '#E67E22', '#7D3C98',
    '#2E86C1', '#138D75', '#D4AC0D', '#A569BD', '#5D6D7E'
  ];

  return (
    <div>
          <Typography sx={{pt: 0.9, pb:1.3, fontWeight:'600'}} variant='h6' color='textPrimary'>Algorithms</Typography>
          <PieChart
            width={550} height={270}
          >
            <Pie
              data={cryptoData}
              cx="50%"
              cy="50%"
              label={({ name, value }) => `${name} (${value})`}
              outerRadius={100}
              strokeWidth={0.5}
              dataKey="value"
            >
              {cryptoData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(index)} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value}`, name]} />

          </PieChart>
    </div>
  );
};


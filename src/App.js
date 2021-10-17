import './App.css';
import React, { useState } from 'react';
import Pairing from './Pairing';
import Inspector from './Inspector';
import { Box } from '@mui/material';



export default function App() {
  const [device, setDevice] = useState(null);
  const [resume, setResume] = useState(false);

  const disconnect = function () {
    setDevice(false);
    setResume(true);
  }

  return (
    <Box m={2}>
      {device ?
        (<Inspector device={device} onDisconnect={disconnect} />) :
        (<Pairing onConnect={setDevice} resume={resume} />)}
    </Box>
  )
}
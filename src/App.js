import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Components/Home';
import Weather from './Components/weather';
import './App.css';

const App = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/weather/:cityName" element={<Weather />} />
  </Routes>
);

export default App;

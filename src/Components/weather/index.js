import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const kelvinToCelsius = (temp) => temp - 273.15;

const Weather = () => {
  const { cityName } = useParams();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);

      try {
        const encodedCityName = encodeURIComponent(cityName.trim());
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodedCityName}&appid=f90b2189de32d03cfed504e4361f48fd&units=metric`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch weather data: ${response.statusText}`);
        }
        
        const data = await response.json();
        setWeatherData(data);
        console.log(data)
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [cityName]); 

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  if (!weatherData) return <p>No data available</p>;

  return (
    <div className='weather-cont'>
      <h1 className='names'>{weatherData.name}</h1>
      <div className='temp-cont'>
      <p className="temp">Temperature: {weatherData.main.temp.toFixed(1)}°C</p>
      <p className='desc'>Description: {weatherData.weather[0]?.description || 'No description available'}</p>
      <p className='humidity'>Humidity: {weatherData.main.humidity}%</p>
      <p className='wind'>Wind Speed: {weatherData.wind.speed} m/s</p>
      <p className='pressure'>Pressure: {weatherData.main.pressure} hPa</p>
      </div>
      {/* Add more details and optional features as needed */}
    </div>
  );
};

export default Weather;

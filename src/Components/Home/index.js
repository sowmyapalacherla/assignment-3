import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './index.css';
const apiStatusConsonants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
};

const PAGE_SIZE = 10;

const Home = () => {
  const [apiStatus, setApiStatus] = useState(apiStatusConsonants.initial);
  const [rowData, setRowData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]); 
  const [showSuggestions, setShowSuggestions] = useState(false); 
  const [totalRecords, setTotalRecords] = useState(0);
  const navigate = useNavigate();

  const columnDefs = [
    {
      headerName: 'City',
      field: 'name',
      sortable: true,
      filter: true,
      cellRenderer: params => (
        <span
          className="city-link"
          onClick={() => handleCityClick(params.value)}
          style={{ cursor: 'pointer', textDecoration: 'none' }}
        >
          {params.value}
        </span>
      ),
    },
    { headerName: 'Country', field: 'country_name', sortable: true, filter: true },
    { headerName: 'Timezone', field: 'timezone', sortable: true, filter: true },
    { headerName: 'Population', field: 'population', sortable: true, filter: true },
    { headerName: 'Longitude', field: 'longitude', sortable: true, filter: true },
    { headerName: 'Latitude', field: 'latitude', sortable: true, filter: true },
  ];

  const fetchSuggestions = async (query) => {
    if (query.length === 0) {
      setSuggestions([]);
      return;
    }

    const url = `https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&q=${query}&rows=5`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error fetching suggestions');
      }
      const fetchedData = await response.json();
      const citySuggestions = fetchedData.records.map((record) => record.fields.name);
      setSuggestions(citySuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error.message);
    }
  };

  const fetchData = async (params) => {
    const { startRow, endRow } = params;
    const url = `https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&sort=name&start=${startRow}&rows=${PAGE_SIZE}&q=${searchQuery}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const fetchedData = await response.json();

      const updatedData = fetchedData.records.map((each) => ({
        name: each.fields.name,
        country_name: each.fields.cou_name_en,
        population: each.fields.population,
        latitude: each.fields.coordinates[0],
        longitude: each.fields.coordinates[1],
        id: each.recordid,
        timezone: each.fields.timezone,
      }));

      setTotalRecords(fetchedData.nhits);
      params.successCallback(updatedData, fetchedData.nhits > endRow);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      params.failCallback();
    }
  };

  const dataSource = useCallback(() => ({
    getRows(params) {
      fetchData(params);
    },
  }), [searchQuery]);

  const handleCityClick = (cityName) => {
    navigate(`/weather/${encodeURIComponent(cityName)}`);
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    fetchSuggestions(query);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false); 
  };

  useEffect(() => {
    setApiStatus(apiStatusConsonants.inProgress);
    setApiStatus(apiStatusConsonants.success);
  }, []);

  return (
    <>
      <div className='image'>
        <h1 className='head'>Weather forecasts, nowcasts and history <br /> in a fast and elegant way</h1>
      </div>

    
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search city..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ marginBottom: '10px', padding: '10px', width: '50%' }}
        /> 
        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="ag-grid-container">
        <div className="ag-theme-alpine ag-grid" style={{ height: '100%', width: '100%' }}>
          <AgGridReact
            rowModelType="infinite"
            datasource={dataSource()}
            columnDefs={columnDefs}
            pagination={false}
            cacheBlockSize={PAGE_SIZE}
            infiniteRowModelPageSize={PAGE_SIZE}
          />
        </div>
      </div>

      <style jsx>{`
        .suggestions-list {
          border: 1px solid #ccc;
          max-height: 150px;
          overflow-y: auto;
          list-style-type: none;
          padding: 0;
          margin: 0;
        }
        .suggestions-list li {
          padding: 10px;
          cursor: pointer;
        }
        .suggestions-list li:hover {
          background-color: #f0f0f0;
        }
      `}</style>
    </>
  );
};

export default Home;

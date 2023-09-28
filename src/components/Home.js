import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Welcome to the Staffing Portal</h1>
      <div>
        <Link to="/projects">
          <button>Projects</button>
        </Link>
      </div>
      <div>
        <Link to="/people">
          <button>Availability List</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;

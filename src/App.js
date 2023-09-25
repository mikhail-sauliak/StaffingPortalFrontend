import './App.css';
import { Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import ProjectList from './components/ProjectList';
import PersonList from './components/PersonList';

function App() {
  return (
    <div className="App">
        <Routes>
          <Route path="/" element={<Home />} /> {/* Домашняя страница */}
          <Route path="/projects" element={<ProjectList />} /> {/* Страница проектов */}
          <Route path="/people" element={<PersonList />} /> {/* Страница людей */}
        </Routes>
    </div>
  );
};

export default App;

import Home from './components/Home';
import ProjectList from './components/ProjectList';
import PersonList from './components/PersonList';
import Header from './components/Header';
import { Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <div>
      <div>
        <Header />
      </div>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/people" element={<PersonList />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
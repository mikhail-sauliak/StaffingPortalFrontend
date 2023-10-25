import React from 'react';
import { Provider } from 'react-redux';
import store from './store';
import AppRoutes from './Routes';
import Header from './components/Header'; 

import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
    return (
        <Provider store={store}>
            <Header /> 
            <AppRoutes />
        </Provider>
    );
};

export default App;

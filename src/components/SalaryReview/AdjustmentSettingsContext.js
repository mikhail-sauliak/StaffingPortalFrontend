// AdjustmentSettingsContext.js
import React, { createContext, useState, useContext } from 'react';

const AdjustmentSettingsContext = createContext();

export const useAdjustmentSettings = () => useContext(AdjustmentSettingsContext);

export const AdjustmentSettingsProvider = ({ children }) => {
    const [adjustmentSettings, setAdjustmentSettings] = useState({
        PLN: [500, 1000],
        USD: [300, 500],
        EUR: [300, 500],
        // other currencies
    });

    return (
        <AdjustmentSettingsContext.Provider value={{ adjustmentSettings, setAdjustmentSettings }}>
            {children}
        </AdjustmentSettingsContext.Provider>
    );
};

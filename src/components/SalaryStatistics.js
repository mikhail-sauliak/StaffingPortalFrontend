import React, { useState } from 'react';
import axios from 'axios';
import { apiWithAuth } from '../utils/api.js';

const SalaryStatistics = () => {
    const [totalSalaryYear, setTotalSalaryYear] = useState(0);
    const [totalSalaryQuarter, setTotalSalaryQuarter] = useState(0);
    const [totalSalaryMonth, setTotalSalaryMonth] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchSalaryData = async () => {
        setLoading(true);
        try {
            const response = await apiWithAuth.get('salaryreview');
            const salaries = response.data.$values.map(sr => ({
                amount: sr.proposedSalary,
                currency: sr.currency,
                reviewDate: new Date(sr.reviewDate)
            }));
            return salaries;
        } catch (error) {
            console.error('Error fetching salary data:', error);
            setError('Failed to fetch salary data');
            return [];
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrencyRates = async () => {
        try {
            const response = await axios.get('https://v6.exchangerate-api.com/v6/c65860c12d9719d787f11ecd/latest/USD');
            return response.data.conversion_rates;
        } catch (error) {
            console.error('Error fetching currency rates:', error);
            return {};
        }
    };

    const calculateTotalSalary = async () => {
        const salaries = await fetchSalaryData();
        const rates = await fetchCurrencyRates();

        let monthlyTotal = 0;
        salaries.forEach(salary => {
            const rate = rates[salary.currency] || 1;
            monthlyTotal += salary.amount / rate;
        });

        const currentMonth = new Date().getMonth() + 1;

        setTotalSalaryMonth(monthlyTotal); 
        setTotalSalaryYear(monthlyTotal * currentMonth);
        setTotalSalaryQuarter(monthlyTotal * 3);
    };

    return (
        <div>
            <button onClick={calculateTotalSalary} disabled={loading}>
                Calculate Salary Statistics
            </button>
            {loading && <div>Loading...</div>}
            {error && <div>{error}</div>}
            <h3>Total Salary Cost for Current Year in USD: {totalSalaryYear.toFixed(2)}</h3>
            <h3>Total Salary Cost for Current Quarter in USD: {totalSalaryQuarter.toFixed(2)}</h3>
            <h3>Total Salary Cost for Current Month in USD: {totalSalaryMonth.toFixed(2)}</h3>
            {/* other elements */}
        </div>
    );
};

export default SalaryStatistics;

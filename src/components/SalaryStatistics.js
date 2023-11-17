import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiWithAuth } from '../utils/api.js';

const SalaryStatistics = () => {
    const [totalSalaryYear, setTotalSalaryYear] = useState(0);
    const [totalSalaryQuarter, setTotalSalaryQuarter] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getCurrentYear = () => new Date().getFullYear();
    const getCurrentQuarter = () => Math.floor((new Date().getMonth() + 3) / 3);

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

        let yearlyTotal = 0;
        let quarterlyTotal = 0;
        const currentYear = getCurrentYear();
        const currentQuarter = getCurrentQuarter();

        salaries.forEach(salary => {
            const salaryYear = salary.reviewDate.getFullYear();
            const salaryQuarter = Math.floor((salary.reviewDate.getMonth() + 3) / 3);
            const salaryMonth = salary.reviewDate.getMonth();
            const rate = rates[salary.currency] || 1;

            if (salaryYear === currentYear) {
                yearlyTotal += salary.amount / rate;
                if (salaryQuarter === currentQuarter) {
                    quarterlyTotal += salary.amount / rate;
                }
            }
        });

        setTotalSalaryYear(yearlyTotal);
        setTotalSalaryQuarter(quarterlyTotal);
    };

    useEffect(() => {
        calculateTotalSalary();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>Total Salary Cost for Current Year in USD: {totalSalaryYear.toFixed(2)}</h2>
            <h2>Total Salary Cost for Current Quarter in USD: {totalSalaryQuarter.toFixed(2)}</h2>
            <h2>Total Salary Cost for Month in USD: {totalSalary.toFixed(2)}</h2>
            {/* Дополнительные элементы интерфейса */}
        </div>
    );
};

export default SalaryStatistics;

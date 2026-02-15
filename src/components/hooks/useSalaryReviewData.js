// hooks/useSalaryReviewData.js
import { useState, useEffect, useCallback } from 'react';
import { apiWithAuth } from '../../utils/api';

export const useFetchReviews = () => {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchReviews = async () => {
            const response = await apiWithAuth.get('/salaryreview');
            setReviews(response.data.$values);
        };

        fetchReviews();
    }, []);

    return reviews;
};

export const useFetchPeople = () => {
    const [people, setPeople] = useState([]);

    useEffect(() => {
        const fetchPeople = async () => {
            const response = await apiWithAuth.get('people');
            setPeople(response.data.$values);
        };

        fetchPeople();
    }, []);

    return people;
};

export const useMergePeopleAndReviews = (people, reviews) => {
    return people.map(person => {
        const review = reviews.find(review => review.personId === person.id);
        return { ...person, review };
    });
};

export const useFetchSalaryRanges = () => {
    const [salaryRanges, setSalaryRanges] = useState([]);

    useEffect(() => {
        const fetchSalaryRanges = async () => {
            const response = await fetch(`${process.env.PUBLIC_URL}/sr.json`);
            const data = await response.json();
            console.log(`Salary Ranges are:  ${data}`);
            setSalaryRanges(data);
        };

        fetchSalaryRanges();
    }, []);

    return salaryRanges;
};

export const useCalculateAdjustments = (mergedData, salaryRanges, adjustmentSettings) => {
    return mergedData.map(item => {
        const { stream, level } = item;
        const review = item.review || {};
        const currency = review.currency || 'PLN';
        const currentSalary = review.proposedSalary || 0;
        const contractType = review.contractType;


        // console.log(`Processing: ${item.firstName} ${item.lastName}, Stream: ${stream}, Level: ${level}, Current Salary: ${currentSalary}, Currency: ${currency}`);

        const salaryRange = salaryRanges[currency]?.[contractType]?.[level];
        if (!salaryRange) {
            // console.log(`No salary range found for ${currency}-${contractType}-${stream}-${level}, skipping adjustment.`);
            return { ...item, adjustment: 0, proposedNewSalary: currentSalary, overflow: null };
        }

        const minSalary = salaryRange[`${stream}_min`];
        const maxSalary = salaryRange[`${stream}_max`];
        const [minAdjustment, maxAdjustment] = adjustmentSettings[currency];

        let adjustment = 0;
        let proposedNewSalary = currentSalary;
        let overflow = null;

        if (currentSalary < minSalary) {
            adjustment = minSalary - currentSalary;
            proposedNewSalary += adjustment;
        } else if (currentSalary >= minSalary && currentSalary < maxSalary) {
            adjustment = maxSalary - currentSalary < minAdjustment ? maxSalary - currentSalary : minAdjustment;
            if (currentSalary + adjustment > maxSalary) {
                adjustment = maxSalary - currentSalary; // not exceeding max salary
            }
            proposedNewSalary += adjustment;
        } else if (currentSalary >= maxSalary) {
            overflow = currentSalary - maxSalary;            
            adjustment = 0; // no adjustment since it's already above the max
        }

        // adjustment does not exceed the adjustmentSettings range
        if (adjustment < minAdjustment && currentSalary + minAdjustment <= maxSalary) {
            adjustment = minAdjustment;
            proposedNewSalary = currentSalary + adjustment;
        }
        if (adjustment > maxAdjustment) {
            adjustment = maxAdjustment;
            proposedNewSalary = currentSalary + adjustment;
        }

        if (proposedNewSalary > maxSalary) {
            overflow = proposedNewSalary - maxSalary; // overflow is negative
            proposedNewSalary = currentSalary;
        }

        return {
            ...item,
            stream,
            currentSalary,
            adjustment: overflow ? 0 : adjustment,
            currency,
            proposedNewSalary,
            overflow,
            lastReviewDate: review.newSalaryStartDate ? review.newSalaryStartDate : 'N/A'
        };
    });
};

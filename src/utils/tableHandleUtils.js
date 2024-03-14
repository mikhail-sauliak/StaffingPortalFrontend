import { debounce } from 'lodash';

export const debouncedHandleSalaryChange = debounce((personId, monthIndex, newSalary, setEditedSalaries) => {
    setEditedSalaries((prevSalaries) => {
        const newSalaries = { ...prevSalaries };

        if (!newSalaries[personId]) {
            newSalaries[personId] = new Array(12).fill(null);
        }

        for (let i = monthIndex; i < 12; i++) {
            newSalaries[personId][i] = newSalary;
        }

        return newSalaries;
    });
}, 100);

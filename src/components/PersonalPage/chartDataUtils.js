// chartDataUtils.js
import { subYears, addYears } from 'date-fns';
import { levelOptions } from '../hooks/selectOptions';

export const updateChartData = (fetchedHistory, currentSalary, fetchedTitleHistory, people, selectedPersonId, salaryRanges, chartMode, currentTitle, setChartData) => {
    let sortedHistory = [];
    if (fetchedHistory) {
        sortedHistory = fetchedHistory.sort((a, b) => new Date(a.reviewDate) - new Date(b.reviewDate));
    }
    let percentageData = [];
    let absoluteData = [];
    let titleData = [];
    let minSalaryData = [];
    let maxSalaryData = [];

    const person = people.find(p => p.id === selectedPersonId);
    let currentLevel = currentTitle;
    let currencySymbol = 'zł';

    if (person) {
        currentLevel = person.level;
    }

    if (currentSalary) {
        switch (currentSalary.currency) {
            case 'PLN':
                currencySymbol = 'zł';
                break;
            case 'EUR':
                currencySymbol = '€';
                break;
            case 'USD':
                currencySymbol = '$';
                break;
            default:
                currencySymbol = 'zł';
        }
    }

    if (sortedHistory.length === 0 && currentSalary) {
        const salaryReceivedDate = new Date(currentSalary.salaryReceivedDate);
        const oneYearBefore = subYears(salaryReceivedDate, 1);

        absoluteData.push({ x: oneYearBefore, y: currentSalary.oldSalary });
        absoluteData.push({ x: salaryReceivedDate, y: currentSalary.proposedSalary });
        absoluteData.push({ x: addYears(salaryReceivedDate, 1), y: currentSalary.proposedSalary });
    } else if (sortedHistory.length > 0) {
        const initialDate = new Date(sortedHistory[0].reviewDate);
        initialDate.setMonth(initialDate.getMonth() - 6);
        absoluteData.push({ x: initialDate, y: sortedHistory[0].oldSalary });

        sortedHistory.forEach((review, index) => {
            if (index === 0) {
                const percentageChange = ((review.proposedSalary - review.oldSalary) / review.oldSalary) * 100;
                percentageData.push({ x: new Date(review.reviewDate), y: Math.round(percentageChange) });
            } else {
                const previousReview = sortedHistory[index - 1];
                const percentageChange = ((review.proposedSalary - previousReview.proposedSalary) / previousReview.proposedSalary) * 100;
                percentageData.push({ x: new Date(review.reviewDate), y: Math.round(percentageChange) });
            }
            absoluteData.push({ x: new Date(review.reviewDate), y: review.proposedSalary });
        });

        if (currentSalary && sortedHistory.length > 0) {
            const lastReview = sortedHistory[sortedHistory.length - 1];
            const percentageChange = ((currentSalary.proposedSalary - lastReview.proposedSalary) / lastReview.proposedSalary) * 100;
            percentageData.push({ x: new Date(), y: Math.round(percentageChange) });
            absoluteData.push({ x: new Date(), y: currentSalary.proposedSalary });
        }
    }

    if (currentSalary && currentLevel) {
        const salaryReceivedDate = new Date(currentSalary.salaryReceivedDate);

        const minSalary = salaryRanges[currentSalary.currency][currentSalary.contractType][currentLevel][`${person.stream}_min`];
        const maxSalary = salaryRanges[currentSalary.currency][currentSalary.contractType][currentLevel][`${person.stream}_max`];

        minSalaryData.push({ x: subYears(salaryReceivedDate, 1), y: minSalary });
        maxSalaryData.push({ x: subYears(salaryReceivedDate, 1), y: maxSalary });
        minSalaryData.push({ x: addYears(salaryReceivedDate, 1), y: minSalary });
        maxSalaryData.push({ x: addYears(salaryReceivedDate, 1), y: maxSalary });
    }

    fetchedTitleHistory.forEach((titleChange) => {
        const titleIndex = levelOptions.findIndex(option => option.value === titleChange.newTitle);
        if (titleIndex !== -1) {
            titleData.push({ x: new Date(titleChange.dateChanged), y: titleIndex });
        }
    });

    const datasets = [
        chartMode === 'absolute' ? {
            label: 'Salary Over Time',
            data: absoluteData,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            pointRadius: 5,
            pointBackgroundColor: 'rgb(75, 192, 192)',
        } : {
            label: 'Percentage Change',
            data: percentageData,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            pointRadius: 5,
            pointBackgroundColor: 'rgb(255, 99, 132)',
        },
        {
            label: 'Title Changes',
            data: titleData,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            pointRadius: 5,
            pointBackgroundColor: 'rgb(54, 162, 235)',
            yAxisID: 'y-title',
        },
        {
            label: `Min Salary Range (${currencySymbol} ${currentLevel})`,
            data: minSalaryData,
            borderColor: 'rgba(0, 255, 0, 0.5)',
            backgroundColor: 'rgba(0, 255, 0, 0.5)',
            pointRadius: 5,
            pointBackgroundColor: 'rgba(0, 255, 0, 0.5)',
            fill: '+1', 
            yAxisID: 'y',
        },
        {
            label: `Max Salary Range (${currencySymbol} ${currentLevel})`,
            data: maxSalaryData,
            borderColor: 'rgba(0, 255, 0, 0.5)',
            backgroundColor: 'rgba(0, 255, 0, 0.5)',
            pointRadius: 5,
            pointBackgroundColor: 'rgba(0, 255, 0, 0.5)',
            fill: false, // No fill for the top boundary
            yAxisID: 'y',
        },
    ];

    setChartData({
        datasets,
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        parser: 'yyyy-MM-dd',
                        tooltipFormat: 'll',
                        unit: 'month',
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: chartMode === 'percentage' ? 'Change (%)' : 'Salary'
                    },
                    ticks: {
                        callback: (value) => chartMode === 'percentage' ? `${value}%` : `${currencySymbol}${value}`,
                    }
                },
                'y-title': {
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Title Changes'
                    },
                    ticks: {
                        callback: (value) => levelOptions[value] ? levelOptions[value].label : value,
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                if (context.dataset.label.includes('Min Salary Range') || context.dataset.label.includes('Max Salary Range') || context.dataset.label === 'Salary Over Time') {
                                    label += `${currencySymbol}${context.parsed.y}`;
                                } else {
                                    label += context.parsed.y;
                                    if (context.dataset.label === 'Title Changes') {
                                        label += ` (${levelOptions[context.parsed.y].label})`;
                                    }
                                }
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
};
import React from 'react';
import { Line } from 'react-chartjs-2';
import { subYears } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { levelOptions } from '../hooks/selectOptions';

const SalaryChart = ({ chartData, chartMode, refreshChart }) => {
    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <button
                onClick={refreshChart}
                style={{
                    position: 'absolute',
                    right: 0,
                    zIndex: 1000,
                    border: 'none',
                    background: 'none',
                }}
            >
                <FontAwesomeIcon icon={faSyncAlt} /> Refresh
            </button>
            <Line
                data={chartData}
                options={{
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'year',
                                min: subYears(new Date(), 5),
                                max: new Date(),
                                tooltipFormat: 'dd/MM/yyyy',
                                displayFormats: {
                                    year: 'yyyy',
                                },
                            },
                            title: {
                                display: true,
                                text: 'Date',
                            },
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: chartMode === 'percentage' ? 'Percentage Change' : 'Salary',
                            },
                        },
                        'y-title': {
                            position: 'right',
                            title: {
                                display: true,
                                text: 'Title Changes',
                            },
                            ticks: {
                                callback: (value) => levelOptions[value] ? levelOptions[value].label : value,
                            },
                            grid: {
                                drawOnChartArea: false,
                            },
                        },
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        if (context.dataset.label === 'Title Changes') {
                                            label += levelOptions[context.parsed.y].label;
                                        } else {
                                            if (chartMode === 'percentage') {
                                                label += `${context.parsed.y}%`;
                                            } else {
                                                label += `$${context.parsed.y}`;
                                            }
                                        }
                                    }
                                    return label;
                                },
                            },
                        },
                    },
                }}
            />
        </div>
    );
};

export default SalaryChart;

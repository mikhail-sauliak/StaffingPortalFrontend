export const exportToCsv = (data, processSalariesForYear, calculateTotalYearlySalary, currentYear) => {
    const now = new Date();
    const formattedDateTime = now.toISOString().replace(/:\d{2}\..*/, '').replace(/T/, '_').replace(/:/g, '-');
    const filename = `salary_data_${formattedDateTime}`;
    let csvContent = "data:text/csv;charset=utf-8,";
    
    csvContent += "ID,Name,Stream," + Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('en', { month: 'short' })).join(",") + ",Total Sum\n";
    
    data.forEach((person) => {
        let row = `${person.personId},${person.fullName},${person.stream},`;
        const monthlySalaries = processSalariesForYear(person.salaries.$values, currentYear);
        
        const monthlySalariesCsv = monthlySalaries.map(salary => salary ? `${salary}` : '-').join(",");
        
        const totalYearlySalary = calculateTotalYearlySalary(monthlySalaries);
        
        row += monthlySalariesCsv + `,${totalYearlySalary} ${person.currency}`;
        csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename + ".csv");
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
};
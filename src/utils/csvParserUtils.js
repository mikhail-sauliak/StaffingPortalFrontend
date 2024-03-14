export function processDataForRow(row) {    
    function classifyRole(role) {
      let stream = role.includes("SDET") ? "SDET" : "QA";
      let level = "Middle"; // default
  
      if (role.includes("Sr.") || role.includes("Senior")) {
        level = "Senior";
      } else if (role.includes("Jr.") || role.includes("Junior")) {
        level = "Junior";
      } else if (role.includes("Lead")) {
        level = "Lead";
      } else if (role.includes("Principal")) {
        level = "Principal";
      } else if (role.includes("Intern")) {
        level = "Intern";
      }
  
      return { stream, level };
    }
  
    const { stream, level } = classifyRole(row[4]); // row[4] колонка Job title
      
    const dataToSend = {
      firstName: row[0], // First name en
      lastName: row[1], // Last name en
      location: row[11], // Office
      divisionManagerId: '1', // hardcoded value
      talentManagerId: '1', // hardcoded value
      availableFrom: new Date().toISOString().split('T')[0], // дата в формате YYYY-MM-DD
      techStack: 'Manual', // hardcoded value 
      plannedAssignment: row[11], // сurrent assignment
      comments: '', // Empty string
      stream, //  из функции classifyRole
      tmAware: 'Not', // hardcoded value
      level, //  из функции classifyRole
      assignmentExistsInGCP: row[10] ? true : false, // если в Current assignment есть данные, то true
    };
  
    return dataToSend;
  }
  
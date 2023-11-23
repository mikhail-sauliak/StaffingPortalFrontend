import { useState, useEffect } from 'react';
import { apiWithAuth } from '../../utils/api.js';

const useFetchManagers = () => {
  const [divisionManagers, setDivisionManagers] = useState([]);
  const [talentManagers, setTalentManagers] = useState([]);

  useEffect(() => {
    fetchDivisionManagers();
  }, []);

  const fetchDivisionManagers = async () => {
    try {
      const response = await apiWithAuth.get('administration/division-managers');
      const managers = response.data.$values.map(manager => {
        const { firstName, lastName } = splitUsername(manager.username);
        return { 
          value: manager.id, 
          label: `${firstName} ${lastName}`
        };
      });
      setDivisionManagers(managers);
      setTalentManagers(managers);
    } catch (error) {
      console.error('Error fetching division managers:', error);
    }
  };

  const updateTalentManagersList = async (divisionManagerId) => {
    try {
      const response = await apiWithAuth.get(`administration/division-manager/${divisionManagerId}/talent-managers`);
      const additionalManagers = response.data.$values.map(manager => {
        const { firstName, lastName } = splitUsername(manager.username);
        return { 
          value: manager.id, 
          label: `${firstName} ${lastName}`
        };
      });

      setTalentManagers([...divisionManagers, ...additionalManagers]);
    } catch (error) {
      console.error('Error fetching talent managers:', error);
    }
  };

  return [divisionManagers, talentManagers, updateTalentManagersList];
};

function splitUsername(username) {
  const splitName = username.replace(/([A-Z])/g, ' $1').trim();
  const nameParts = splitName.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');
  return { firstName, lastName };
}

export default useFetchManagers;

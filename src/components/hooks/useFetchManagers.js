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
      const managers = normalizeManagers(response.data);
      setDivisionManagers(managers);
      setTalentManagers(managers);
    } catch (error) {
      console.error('Error fetching division managers:', error);
    }
  };

  const updateTalentManagersList = async (divisionManagerId) => {
    if (!divisionManagerId) {
      setTalentManagers(divisionManagers);
      return;
    }

    try {
      const response = await apiWithAuth.get(`administration/division-manager/${divisionManagerId}/talent-managers`);
      const additionalManagers = normalizeManagers(response.data);

      const selectedDivisionManager = divisionManagers.find(
        (manager) => String(manager.value) === String(divisionManagerId)
      );

      const managersToSet = selectedDivisionManager
        ? [selectedDivisionManager, ...additionalManagers]
        : additionalManagers;

      if (!managersToSet.length) {
        setTalentManagers(divisionManagers);
        return;
      }

      const uniqueManagers = managersToSet.reduce((acc, manager) => {
        if (!acc.some(item => item.value === manager.value)) {
          acc.push(manager);
        }
        return acc;
      }, []);

      setTalentManagers(uniqueManagers);
    } catch (error) {
      console.error('Error fetching talent managers:', error);
    }
  };

  return [divisionManagers, talentManagers, updateTalentManagersList];
};

const normalizeManagers = (payload) => {
  if (!payload) {
    return [];
  }

  const collection = Array.isArray(payload) ? payload : payload.$values || [];

  return collection
    .filter((manager) => isActiveManager(manager))
    .map((manager) => {
      const { firstName, lastName } = splitUsername(manager.username ?? '');
  const fallbackLabel = `${firstName} ${lastName}`.trim();
  const label = ((manager.fullName ?? fallbackLabel) || manager.username || '').trim();

      return {
        value: manager.personId,
        userId: manager.id,
        label,
      };
    });
};

const isActiveManager = (manager) => {
  if (!manager) {
    return false;
  }

  if (manager.isDismissed) {
    return false;
  }

  if (manager.endDate) {
    const today = new Date();
    const endDate = new Date(manager.endDate);
    if (endDate < today) {
      return false;
    }
  }

  return true;
};

function splitUsername(username) {
  const splitName = username.replace(/([A-Z])/g, ' $1').trim();
  const nameParts = splitName.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');
  return { firstName, lastName };
}

export default useFetchManagers;

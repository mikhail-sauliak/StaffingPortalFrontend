// useSelectOptions.js
import { useState } from 'react';

const useSelectOptions = (initialOptions, defaultValue) => {
  const [selectedOption, setSelectedOption] = useState(defaultValue);

  const handleChange = (option) => {
    setSelectedOption(option);
  };

  return [selectedOption, handleChange];
};

export default useSelectOptions;

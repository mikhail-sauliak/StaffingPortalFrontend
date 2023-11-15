import { useState } from 'react';

const useFormInput = (initialValues) => {
  const [formData, setFormData] = useState(initialValues);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (type === 'radio' && name === 'assignmentExistsInGCP') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return [formData, handleInputChange, setFormData];
};

export default useFormInput;

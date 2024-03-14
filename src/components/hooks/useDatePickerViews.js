import { useState } from 'react';

export function useDatePickerViews(initialView = 'year') {
  const [view, setView] = useState(initialView);
  const [open, setOpen] = useState(false);

  const handleChange = (newValue) => {
    if (view === 'year') {
      setView('month'); 
      setOpen(true); 
    } else {
      setOpen(false); 
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setView('year');
  };

  return { view, open, onOpen: handleOpen, onChange: handleChange, setOpen };
}

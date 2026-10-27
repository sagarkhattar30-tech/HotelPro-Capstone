import { createContext, useContext, useState, useCallback } from 'react';

const SupportContext = createContext({
  openSupport: () => {},
  closeSupport: () => {},
  isSupportOpen: false,
  initialCategory: 'Housekeeping'
});

export function SupportProvider({ children }) {
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [initialCategory, setInitialCategory] = useState('Housekeeping');

  const openSupport = useCallback((category = 'Housekeeping') => {
    setInitialCategory(category);
    setIsSupportOpen(true);
  }, []);

  const closeSupport = useCallback(() => {
    setIsSupportOpen(false);
  }, []);

  return (
    <SupportContext.Provider value={{ openSupport, closeSupport, isSupportOpen, initialCategory }}>
      {children}
    </SupportContext.Provider>
  );
}

export const useSupport = () => useContext(SupportContext);

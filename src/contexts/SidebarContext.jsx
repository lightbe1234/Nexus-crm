import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  
  const toggle = () => setCollapsed(c => !c);
  const toggleHidden = () => setIsHidden(h => !h);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, isHidden, toggleHidden }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

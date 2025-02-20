import React, { createContext, useState, ReactNode } from 'react';

const AuthContext = createContext({
  isAuthentified: false,
  setIsAuthentified: (value: boolean) => {},
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthentified, setIsAuthentified] = useState(false);

  return (
    <AuthContext.Provider value={{ isAuthentified, setIsAuthentified }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
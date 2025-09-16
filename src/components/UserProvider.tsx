'use client';

import { useState } from 'react';
import { UserContext } from '../UserContext';
import NavBar from './NavBar';



export default function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  return (
    <div className="app">
      <NavBar />
      <UserContext.Provider value={{ user, setUser }}>
        {children}
      </UserContext.Provider>
    </div>
  );
}
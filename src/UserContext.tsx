import { createContext, useContext } from 'react';

export const UserContext = createContext<{ user: any, setUser: (u: any) => void }>({ user: null, setUser: () => {} });

export function useUser() {
  return useContext(UserContext);
}
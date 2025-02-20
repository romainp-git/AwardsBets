import React, { createContext, useContext, useState } from "react";
import { getUserInfos, getAllUsers } from "../api";
import { User } from "../types/types";

const UserContext = createContext({
    user: null as User | null,
    users: [] as User[],
    refreshUser: async () => {},
    refreshUsers: async () => {},
    setUser: (user: User | null) => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);


  const refreshUser = async () => {
    const updatedUser = await getUserInfos();
    setUser(updatedUser);
  };

  const refreshUsers = async () => {
    const allUsers = await getAllUsers();
    setUsers(allUsers);
  };

  return (
    <UserContext.Provider value={{ user, users, refreshUser, refreshUsers, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
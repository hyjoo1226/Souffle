import { createContext, useContext, useState } from "react";
import { User } from "@/types/User";

interface UserContextType {
  user: User | null;
  setUser: (user: User | ((prev: User | null) => User | null)) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("UserProvider 안에서만 useUser를 사용할 수 있습니다!");
  }
  return context;
};
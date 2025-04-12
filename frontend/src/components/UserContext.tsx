import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

interface User {
  name: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => { },
  loading: false
});



export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  axios
    .get(`${BACKEND_URL}/me`, {
      withCredentials: true,
    })
    .then((res) => {
      if (res.data.user) {
        setUser({
          name: res.data.user.name,
          email: res.data.user.email,
        });
      } else {
        setUser(null);
      }
    })
    .catch(() => {
      setUser(null);
    })
    .finally(() => {
      setLoading(false); // Done loading
    });
}, []);

  

  return (
    <UserContext.Provider value={{ user, setUser, loading  }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

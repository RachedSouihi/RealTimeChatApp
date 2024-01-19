import { createContext, useContext, useState } from "react";

const UserDataContext = createContext(null);

export const UserDataProvider = ({children}) => {
    const [userData, setUserData] = useState({});

    const obj = {
        userData: userData,
        setUserData: setUserData,
    }

    return <UserDataContext.Provider value={obj}>{children}</UserDataContext.Provider>
}

export const useUserData = () => useContext(UserDataContext)
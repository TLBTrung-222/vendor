import Helpers from "../utils/Helpers";
import { createContext, useContext, useState } from "react";
import { useTranslation } from "react-i18next";

interface IUserContext {
  language: string;
  setLanguage: (value: any) => void;

  logIn: (access: string, refresh: string) => void;
  logOut: () => void;

  isAuthenticated: boolean;
  userProfile: any;

  adminState: any;
  setAdminState: (state: any) => void;

  pageTitle: string;
  setPageTitle: (value: string) => void;
}

const UserContext = createContext<IUserContext | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();
  const language = i18n.language;
  const [pageTitle, setPageTitle] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(Helpers.isLoggedIn());
  const [userProfile, setUserProfile] = useState(Helpers.getUserInfo());
  const [adminState, setAdminState] = useState({
    newVendorForm: false,
    newTemplateForm: false,
  });

  // SET LANGUAGE
  const setLanguage = (value: any) => {
    i18n.changeLanguage(value);
  };

  // HANDLE LOGIN DATA
  const logIn = (access: string, refresh: string) => {
    const userInfo = Helpers.decodeToken(access);
    setIsAuthenticated(true);
    Helpers.storeAccessToken(access);
    Helpers.storeRefreshToken(refresh);
    Helpers.storeUserInfo(userInfo.user);
    setUserProfile(userInfo.user);
  };

  // HANDLE LOGOUT DATA
  const logOut = () => {
    Helpers.removeUserInfo();
    Helpers.clearToken();
    setIsAuthenticated(false);
  };

  return (
    <UserContext.Provider
      value={{
        language,
        setLanguage,
        logIn,
        logOut,
        userProfile,
        isAuthenticated,
        adminState,
        setAdminState,
        pageTitle,
        setPageTitle,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

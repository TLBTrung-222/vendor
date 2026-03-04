import Helpers from "../utils/Helpers";
import { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { vendorAPI } from "../services/vendorAPI";

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

  getTranslation: (id: number) => string | undefined;
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
  const [translation, setTranslation] = useState<any>({});

  // SET LANGUAGE
  const setLanguage = (value: any) => {
    i18n.changeLanguage(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await vendorAPI.getTranslations(
          language === "en"
            ? "1"
            : language === "de"
              ? "2"
              : language === "pl"
                ? "3"
                : "4",
        );
        const map: Record<
          number,
          { de: string; en: string; pl: string; sk: string }
        > = {};
        response.data.data.forEach((item: any) => {
          map[item.id] = item.content;
        });
        setTranslation(map);
        // setIsSplash(false);
      } catch (error) {
        Helpers.notification.error("Error fetching translations");
      }
    };
    fetchData();
  }, [language]);

  const getTranslation = (id: number) => {
    if (!translation[id]) return undefined;
    return translation[id];
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
        getTranslation,
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

import { message, Modal } from "antd";
import { Cookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

const COOKIE_USER_INFO = "uif";
const COOKIE_ACCESS_TOKEN = "atk";
const COOKIE_REFRESH_TOKEN = "rtk";

const cookies = new Cookies();
const setCookie = (name: string, value: string): void =>
  cookies.set(name, value, { path: "/" });
const getCookie = (name: string): string => cookies.get(name) || "";
const removeCookie = (name: string): void => cookies.remove(name);

class Helpers {
  getRefreshToken = (): string => localStorage.getItem("refreshToken") || "";
  D;

  storeRefreshToken = (refreshToken: string): void =>
    setCookie(COOKIE_REFRESH_TOKEN, refreshToken);

  getAccessToken = (): string => localStorage.getItem("accessToken") || "";

  storeAccessToken = (accessToken: string): void =>
    setCookie(COOKIE_ACCESS_TOKEN, accessToken);

  clearToken = (): void => {
    removeCookie(COOKIE_REFRESH_TOKEN);
    removeCookie(COOKIE_ACCESS_TOKEN);
  };

  getUserInfo = () => {
    const userInfo: any = getCookie(COOKIE_USER_INFO);
    return userInfo !== "" ? userInfo : null;
  };

  storeUserInfo = (userInfo: object): void => {
    const userInfoString = JSON.stringify(userInfo);
    setCookie(COOKIE_USER_INFO, userInfoString);
  };

  removeUserInfo = (): void => {
    removeCookie(COOKIE_USER_INFO);
  };

  isLoggedIn = (): boolean => {
    return localStorage.getItem("accessToken") ? true : false;
  };

  isAdmin = () => {
    return this.getUserInfo().role.title == "Admin";
  };

  isProjectManager = () => {
    return this.getUserInfo().role.title == "Project manager";
  };

  decodeToken = (token: string) => {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  };

  notification = {
    success: (content: string) => {
      message.open({
        type: "success",
        content: content,
      });
    },
    error: (content: string) => {
      message.open({
        type: "error",
        content: content,
      });
    },
    warning: (content: string) => {
      message.open({
        type: "warning",
        content: content,
      });
    },
  };

  isISODateString = (str: string) => {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/;
    return isoRegex.test(str);
  };

  formatDateTime = (isoString: string) => {
    if (!isoString) return;
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).format(date);
  };

  handleSubmit = async () => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const email = urlSearchParams.get("email") || "";
    const navigate = useNavigate();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login-vendor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: "Password123@",
          }),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        const decoded = this.decodeToken(result.data.access_token);

        localStorage.setItem("accessToken", result.data.access_token);
        localStorage.setItem("refreshToken", result.data.refresh_token);

        localStorage.setItem("user", JSON.stringify(decoded.user));

        navigate("/");
      } else {
        this.notification.error(
          result.message ||
            "Login failed. Please check your credentials and try again."
        );
      }
    } catch (error) {
      this.notification.error(
        "An error occurred during login. Please try again later."
      );
    }
  };

  whichInstace = () => {
    if (window.location.hostname == "ext.atlas.galvanek-bau.de") {
      return "prod";
    }
    if (window.location.hostname == "beta.ext.atlas.galvanek-bau.de") {
      return "beta";
    }
    return "alpha";
  };
}

const instance = new Helpers();
export default instance;

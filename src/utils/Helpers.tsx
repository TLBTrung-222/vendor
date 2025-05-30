//import { message, Modal } from "@mui/material";
import { Cookies } from "react-cookie";

const COOKIE_USER_INFO = "uif";
const COOKIE_ACCESS_TOKEN = "atk";
const COOKIE_REFRESH_TOKEN = "rtk";

const cookies = new Cookies();
const setCookie = (name: string, value: string): void =>
  cookies.set(name, value, { path: "/" });
const getCookie = (name: string): string => cookies.get(name) || "";
const removeCookie = (name: string): void => cookies.remove(name);

class Helpers {
  getRefreshToken = (): string => getCookie(COOKIE_REFRESH_TOKEN);

  storeRefreshToken = (refreshToken: string): void =>
    setCookie(COOKIE_REFRESH_TOKEN, refreshToken);

  getAccessToken = (): string => getCookie(COOKIE_ACCESS_TOKEN);

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
    return this.getUserInfo() == null || this.getUserInfo() === undefined
      ? false
      : true;
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

  redirect = (url: string) => {
    window.location.href = url;
  };

//   notification = {
//     success: (content: string) => {
//       message.open({
//         type: "success",
//         content: content,
//       });
//     },
//     error: (content: string) => {
//       message.open({
//         type: "error",
//         content: content,
//       });
//     },
//     warning: (content: string) => {
//       message.open({
//         type: "warning",
//         content: content,
//       });
//     },
//   };

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

//   confirmModal = (
//     content: string,
//     fnCallback: () => void,
//     okText?: string,
//     t: any = (text: string) => text
//   ) => {
//     Modal.confirm({
//       title: `${t("Confirm")}`,
//       content: (
//         <div>
//           <p>{content}</p>
//         </div>
//       ),
//       onOk: () => fnCallback(),
//       okText: okText || "Ok",
//       okType: okText === t("Delete") ? "danger" : "primary",
//       cancelText: t("Cancel"),
//     });
//   };
}

const instance = new Helpers();
export default instance;

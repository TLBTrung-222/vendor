import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

if (!localStorage.getItem("i18nextLng")) {
  const urlParams = new URLSearchParams(window.location.search);
  const language = urlParams.get("language");
  if (language) {
    localStorage.setItem("i18nextLng", language);
  } else {
    localStorage.setItem("i18nextLng", "de");
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

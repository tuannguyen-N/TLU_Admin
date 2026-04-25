import type { Configuration, PopupRequest } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: "77df993d-e728-4b8e-9770-6b409aa99552",
    authority: "https://login.microsoftonline.com/aec003eb-c537-4e8a-b0f3-1144a93a60bc",
    redirectUri: "http://localhost:5173/auth/callback",
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
};

export const loginRequest: PopupRequest = {
  scopes: ["openid", "profile", "email", "User.Read"],
};
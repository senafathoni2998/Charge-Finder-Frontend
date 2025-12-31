import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ConnectorType } from "../../models/model";

type AuthState = {
  isAuthenticated: boolean;
  email: string | null;
  car: UserCar | null;
};

export type UserCar = {
  name: string;
  connectorTypes: ConnectorType[];
  minKW: number;
};

const VALID_CONNECTORS = new Set<ConnectorType>(["CCS2", "Type2", "CHAdeMO"]);

const parseCar = (raw: string | null): UserCar | null => {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<UserCar>;
    if (!data || typeof data !== "object") return null;
    const name =
      typeof data.name === "string" && data.name.trim()
        ? data.name.trim()
        : "My EV";
    const connectorTypes = Array.isArray(data.connectorTypes)
      ? data.connectorTypes.filter((c): c is ConnectorType =>
          VALID_CONNECTORS.has(c as ConnectorType)
        )
      : [];
    const minKW = Number.isFinite(data.minKW) ? Number(data.minKW) : 0;
    return { name, connectorTypes, minKW };
  } catch {
    return null;
  }
};

const getInitialAuth = (): AuthState => {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, email: null, car: null };
  }
  try {
    const token = window.localStorage.getItem("cf_auth_token");
    const email = window.localStorage.getItem("cf_auth_email");
    const car = parseCar(window.localStorage.getItem("cf_user_car"));
    return { isAuthenticated: !!token, email: email ?? null, car };
  } catch {
    return { isAuthenticated: false, email: null, car: null };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialAuth(),
  reducers: {
    login(state, action: PayloadAction<{ email: string }>) {
      state.isAuthenticated = true;
      state.email = action.payload.email;
    },
    setCar(state, action: PayloadAction<UserCar | null>) {
      state.car = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.email = null;
      state.car = null;
    },
  },
});

export const { login, logout, setCar } = authSlice.actions;
export default authSlice.reducer;

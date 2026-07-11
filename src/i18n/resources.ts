// Aggregates every translation namespace for both supported languages.
//
// One JSON file per (language, namespace). Page namespaces map 1:1 to page
// folders so string extraction can happen folder-by-folder without touching a
// shared file. When you add a new namespace, create both locale JSON files and
// register them here — this is the single place the app learns about them.

import enCommon from "./locales/en/common.json";
import enNav from "./locales/en/nav.json";
import enValidation from "./locales/en/validation.json";
import enApi from "./locales/en/api.json";
import enMainPage from "./locales/en/mainPage.json";
import enLogin from "./locales/en/login.json";
import enSignup from "./locales/en/signup.json";
import enProfile from "./locales/en/profile.json";
import enStationDetail from "./locales/en/stationDetail.json";
import enAdmin from "./locales/en/admin.json";
import enAddCar from "./locales/en/addCar.json";
import enEditCar from "./locales/en/editCar.json";
import enAddStation from "./locales/en/addStation.json";
import enEditStation from "./locales/en/editStation.json";
import enAddUser from "./locales/en/addUser.json";
import enTrip from "./locales/en/trip.json";
import enNotFound from "./locales/en/notFound.json";
import enRouteError from "./locales/en/routeError.json";
import enSeo from "./locales/en/seo.json";

import idCommon from "./locales/id/common.json";
import idNav from "./locales/id/nav.json";
import idValidation from "./locales/id/validation.json";
import idApi from "./locales/id/api.json";
import idMainPage from "./locales/id/mainPage.json";
import idLogin from "./locales/id/login.json";
import idSignup from "./locales/id/signup.json";
import idProfile from "./locales/id/profile.json";
import idStationDetail from "./locales/id/stationDetail.json";
import idAdmin from "./locales/id/admin.json";
import idAddCar from "./locales/id/addCar.json";
import idEditCar from "./locales/id/editCar.json";
import idAddStation from "./locales/id/addStation.json";
import idEditStation from "./locales/id/editStation.json";
import idAddUser from "./locales/id/addUser.json";
import idTrip from "./locales/id/trip.json";
import idNotFound from "./locales/id/notFound.json";
import idRouteError from "./locales/id/routeError.json";
import idSeo from "./locales/id/seo.json";

export const namespaces = [
  "common",
  "nav",
  "validation",
  "api",
  "mainPage",
  "login",
  "signup",
  "profile",
  "stationDetail",
  "admin",
  "addCar",
  "editCar",
  "addStation",
  "editStation",
  "addUser",
  "trip",
  "notFound",
  "routeError",
  "seo",
] as const;

export const defaultNS = "common";

export const resources = {
  en: {
    common: enCommon,
    nav: enNav,
    validation: enValidation,
    api: enApi,
    mainPage: enMainPage,
    login: enLogin,
    signup: enSignup,
    profile: enProfile,
    stationDetail: enStationDetail,
    admin: enAdmin,
    addCar: enAddCar,
    editCar: enEditCar,
    addStation: enAddStation,
    editStation: enEditStation,
    addUser: enAddUser,
    trip: enTrip,
    notFound: enNotFound,
    routeError: enRouteError,
    seo: enSeo,
  },
  id: {
    common: idCommon,
    nav: idNav,
    validation: idValidation,
    api: idApi,
    mainPage: idMainPage,
    login: idLogin,
    signup: idSignup,
    profile: idProfile,
    stationDetail: idStationDetail,
    admin: idAdmin,
    addCar: idAddCar,
    editCar: idEditCar,
    addStation: idAddStation,
    editStation: idEditStation,
    addUser: idAddUser,
    trip: idTrip,
    notFound: idNotFound,
    routeError: idRouteError,
    seo: idSeo,
  },
} as const;

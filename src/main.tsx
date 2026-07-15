import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n";
import { RouterProvider } from "react-router";
import router from "./router/route";
import { Provider } from "react-redux";
import store from "./app/store";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { SEO } from "./components";
import { registerServiceWorker } from "./utils/registerServiceWorker";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SpeedInsights />
    <Analytics />
    <SEO />
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);

// Enable installability + offline support in production builds. No-ops in dev.
registerServiceWorker();

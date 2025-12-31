import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ActivityStoreProvider } from "./Context/ActivityContext/activityContext.tsx";

createRoot(document.getElementById("root")!).render(
  <ActivityStoreProvider>
    <App />
  </ActivityStoreProvider>
);

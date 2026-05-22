import { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import ReconciliationDashboard from "./pages/ReconciliationDashboard";

type Page = "landing" | "reconciliation";

function getPageFromHash(): Page {
  const hash = window.location.hash.replace("#", "").replace("/", "");
  if (hash === "reconciliation") return "reconciliation";
  return "landing";
}

export default function App() {
  const [page, setPage] = useState<Page>(getPageFromHash);

  useEffect(() => {
    const onHashChange = () => setPage(getPageFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  switch (page) {
    case "reconciliation":
      return <ReconciliationDashboard />;
    default:
      return <LandingPage />;
  }
}

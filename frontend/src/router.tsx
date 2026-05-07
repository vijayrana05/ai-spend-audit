import { createBrowserRouter } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import AuditPage from "@/pages/AuditPage";
import ResultsPage from "@/pages/ResultsPage";
import SharePage from "@/pages/SharePage";

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/audit", element: <AuditPage /> },
  { path: "/results", element: <ResultsPage /> },
  { path: "/share/:id", element: <SharePage /> },
]);

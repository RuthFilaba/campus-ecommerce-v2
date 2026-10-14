import { isPreviewAuth } from "../../services/auth";
import SellerPreviewDashboard from "./SellerPreviewDashboard";
import SellerDashboardPage from "./SellerDashboardPage";

export default function SellerDashboardRoute() {
  return isPreviewAuth ? <SellerPreviewDashboard /> : <SellerDashboardPage />;
}

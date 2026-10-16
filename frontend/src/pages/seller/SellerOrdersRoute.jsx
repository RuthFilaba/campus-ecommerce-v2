import { isPreviewAuth } from "../../services/auth";
import ActiveOrdersPage from "./ActiveOrdersPage";
import SellerPreviewActivityPage from "./SellerPreviewActivityPage";

export default function SellerOrdersRoute() {
  return isPreviewAuth ? <SellerPreviewActivityPage kind="orders" /> : <ActiveOrdersPage />;
}

import { isPreviewAuth } from "../../services/auth";
import SellerOrdersPage from "./SellerOrdersPage";
import SellerPreviewActivityPage from "./SellerPreviewActivityPage";

export default function SellerOrdersRoute() {
  return isPreviewAuth ? <SellerPreviewActivityPage kind="orders" /> : <SellerOrdersPage />;
}

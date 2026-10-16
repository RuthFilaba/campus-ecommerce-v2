import { isPreviewAuth } from "../../services/auth";
import MySalesPage from "./MySalesPage";
import SellerPreviewActivityPage from "./SellerPreviewActivityPage";

export default function SellerSalesRoute() {
  return isPreviewAuth ? <SellerPreviewActivityPage kind="sales" /> : <MySalesPage />;
}

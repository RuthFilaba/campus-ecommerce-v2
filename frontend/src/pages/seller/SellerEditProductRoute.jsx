import { isPreviewAuth } from "../../services/auth";
import EditProductPage from "./EditProductPage";
import SellerPreviewEditProductPage from "./SellerPreviewEditProductPage";

export default function SellerEditProductRoute() {
  return isPreviewAuth ? <SellerPreviewEditProductPage /> : <EditProductPage />;
}

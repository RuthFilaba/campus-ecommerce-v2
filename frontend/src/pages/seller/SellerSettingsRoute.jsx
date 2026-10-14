import { isPreviewAuth } from "../../services/auth";
import StoreSettingsPage from "./StoreSettingsPage";
import SellerPreviewSettingsPage from "./SellerPreviewSettingsPage";

export default function SellerSettingsRoute() {
  return isPreviewAuth ? <SellerPreviewSettingsPage /> : <StoreSettingsPage />;
}

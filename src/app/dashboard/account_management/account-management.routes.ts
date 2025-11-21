import { Routes } from "@angular/router";
import { AccountSettingComponnet } from "./components/account-setting/account-setting";
import { KycComponent } from "./components/kyc/kyc";

export const accountManagementRoute: Routes = [
  { path: "account-setting", component: AccountSettingComponnet },
  { path: "kyc", component:KycComponent}
]
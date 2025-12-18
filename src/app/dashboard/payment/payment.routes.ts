import { Routes } from "@angular/router";
import { Invoice } from "./components/invoice/invoice";

export const paymentRoutes: Routes = [
  {path:"invoice", component:Invoice}
]
import React from "react";
import Home from "../pages/home";

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  name: string;
}

export const routes: RouteConfig[] = [
  {
    path: "/",
    element: Home,
    name: "Home",
  },
];

import React from "react";
import Home from "../pages/home";
import GitPage from "../pages/git";
import DockerPage from "../pages/docker";
import VscodePage from "../pages/vscode";
import FrontendPage from "../pages/frontend";
import BackendPage from "../pages/backend";
import DatabasePage from "../pages/database";
import OtherPage from "../pages/other";

export interface RouteConfig {
  path: string;
  element: React.ComponentType<any>;
  name: string;
}

export const routes: RouteConfig[] = [
  {
    path: "/",
    element: Home,
    name: "Home",
  },
  {
    path: "/git",
    element: GitPage,
    name: "Git",
  },
  {
    path: "/docker",
    element: DockerPage,
    name: "Docker",
  },
  {
    path: "/vs-code",
    element: VscodePage,
    name: "VS Code",
  },
  {
    path: "/frontend",
    element: FrontendPage,
    name: "Frontend",
  },
  {
    path: "/backend",
    element: BackendPage,
    name: "Backend",
  },
  {
    path: "/database",
    element: DatabasePage,
    name: "Database",
  },
  {
    path: "/other",
    element: OtherPage,
    name: "Other",
  },
];

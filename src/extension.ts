import * as vscode from "vscode";

import { CodeLensProvider } from "./codeLens";
import {
  addPkgCommand,
  openCommand,
  openPkgCommand,
  refreshCacheCommand,
  refreshPkgCommand,
  runPkgCommand,
} from "./command";
import { Globals, newGlobals } from "./globals";
import { CacheTreeViewProvider, PkgTreeViewProvider } from "./tree";

const initializeCommands = (globals: Globals): vscode.Disposable[] => {
  return [
    vscode.commands.registerCommand("rspit.runPkg", runPkgCommand(globals)),
    vscode.commands.registerCommand("rspit.open", openCommand),
    vscode.commands.registerCommand("rspit.openPkg", openPkgCommand),
    vscode.commands.registerCommand(
      "rspit.packages.add",
      addPkgCommand(globals)
    ),
    vscode.commands.registerCommand(
      "rspit.packages.refresh",
      refreshPkgCommand(globals)
    ),
    vscode.commands.registerCommand(
      "rspit.caches.refresh",
      refreshCacheCommand(globals)
    ),
  ];
};

const initializeTreeViews = (globals: Globals): vscode.Disposable[] => {
  const pkgTreeViewProvider = new PkgTreeViewProvider();
  const pkgTreeView = vscode.window.createTreeView("rspitPackages", {
    treeDataProvider: pkgTreeViewProvider,
  });

  const refreshAtInterval = () => {
    const pollingIntervalMs = 1000 * 60 * 3; // 3 minutes
    setInterval(() => {
      pkgTreeViewProvider.refresh();
    }, pollingIntervalMs);
  };
  refreshAtInterval();

  pkgTreeView.onDidChangeVisibility((event) => {
    if (event.visible) {
      pkgTreeViewProvider.refresh();
    }
  });

  const cacheTreeViewProvider = new CacheTreeViewProvider();
  const cacheTreeView = vscode.window.createTreeView("rspitCaches", {
    treeDataProvider: cacheTreeViewProvider,
  });

  cacheTreeView.onDidChangeVisibility((event) => {
    if (event.visible) {
      cacheTreeViewProvider.refresh();
    }
  });

  return [
    pkgTreeView,
    cacheTreeView,

    globals.listenEvent(async (event) => {
      switch (event) {
        case "refreshPkg":
          pkgTreeViewProvider.refresh();
          break;
        case "refreshCache":
          cacheTreeViewProvider.refresh();
          break;
      }
    }),
  ];
};

const initializeCodeLens = (): vscode.Disposable => {
  return vscode.languages.registerCodeLensProvider(
    { language: "rust", pattern: "**/rspit.rs" },
    new CodeLensProvider()
  );
};

export function activate(context: vscode.ExtensionContext) {
  const globals: Globals = newGlobals(context);
  context.subscriptions.push(
    ...initializeCommands(globals),
    ...initializeTreeViews(globals),
    initializeCodeLens()
  );
}

export function deactivate() {}

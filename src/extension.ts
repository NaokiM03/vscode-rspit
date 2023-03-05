import * as vscode from "vscode";

import { CodeLensProvider } from "./codeLens";
import {
  addPackageCommand,
  openCommand,
  openPackageCommand,
  refreshCacheCommand,
  refreshPackageCommand,
  runPackageCommand,
} from "./command";
import { Globals, newGlobals } from "./globals";
import { CachesTreeViewProvider, PackagesTreeViewProvider } from "./tree";

const initializeCommands = (globals: Globals): vscode.Disposable[] => {
  return [
    vscode.commands.registerCommand(
      "rspit.runPackage",
      runPackageCommand(globals)
    ),
    vscode.commands.registerCommand("rspit.open", openCommand),
    vscode.commands.registerCommand("rspit.openPackage", openPackageCommand),
    vscode.commands.registerCommand(
      "rspit.packages.add",
      addPackageCommand(globals)
    ),
    vscode.commands.registerCommand(
      "rspit.packages.refresh",
      refreshPackageCommand(globals)
    ),
    vscode.commands.registerCommand(
      "rspit.caches.refresh",
      refreshCacheCommand(globals)
    ),
  ];
};

const initializeTreeViews = (globals: Globals): vscode.Disposable[] => {
  // PACKAGES

  const packagesTreeViewProvider = new PackagesTreeViewProvider();
  const packagesTreeView = vscode.window.createTreeView("rspitPackages", {
    treeDataProvider: packagesTreeViewProvider,
  });

  const refreshAtInterval = () => {
    const pollingIntervalMs = 1000 * 60 * 3; // 3 minutes
    setInterval(() => {
      packagesTreeViewProvider.refresh();
    }, pollingIntervalMs);
  };
  refreshAtInterval();

  packagesTreeView.onDidChangeVisibility((event) => {
    if (event.visible) {
      packagesTreeViewProvider.refresh();
    }
  });

  // CACHES

  const cachesTreeViewProvider = new CachesTreeViewProvider();
  const cachesTreeView = vscode.window.createTreeView("rspitCaches", {
    treeDataProvider: cachesTreeViewProvider,
  });

  cachesTreeView.onDidChangeVisibility((event) => {
    if (event.visible) {
      cachesTreeViewProvider.refresh();
    }
  });

  return [
    packagesTreeView,
    cachesTreeView,

    globals.listenEvent(async (event) => {
      switch (event) {
        case "refreshPackage":
          packagesTreeViewProvider.refresh();
          break;
        case "refreshCache":
          cachesTreeViewProvider.refresh();
          break;
      }
    }),
  ];
};

const initializeCodeLens = (): vscode.Disposable => {
  return vscode.languages.registerCodeLensProvider(
    { language: "rust" },
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

import * as vscode from "vscode";

import { CodeLensProvider } from "./codeLens";
import { addPkgCommand, openCommand, runPkgCommand } from "./command";
import { Globals, newGlobals } from "./globals";
import { PkgTreeViewProvider } from "./tree";

const initializeCommands = (globals: Globals): vscode.Disposable[] => {
  return [
    vscode.commands.registerCommand("rspit.runPkg", runPkgCommand),
    vscode.commands.registerCommand("rspit.open", openCommand),
    vscode.commands.registerCommand(
      "rspit.packages.add",
      addPkgCommand(globals)
    ),
  ];
};

const initializeTreeViews = (globals: Globals): vscode.Disposable[] => {
  const pkgTreeViewProvider = new PkgTreeViewProvider();
  const pkgTreeView = vscode.window.createTreeView("rspitPackages", {
    treeDataProvider: pkgTreeViewProvider,
  });

  return [
    pkgTreeView,
    globals.listenEvent(async (event) => {
      switch (event) {
        case "refresh":
          pkgTreeViewProvider.refresh();
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

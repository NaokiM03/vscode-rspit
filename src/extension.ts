import * as vscode from "vscode";

import { CodeLensProvider } from "./codeLens";
import { addPkgCommand, openCommand, runPkgCommand } from "./command";
import { PkgTreeViewProvider } from "./tree";

const initializeCommands = (
  _context: vscode.ExtensionContext
): vscode.Disposable[] => {
  return [
    vscode.commands.registerCommand("rspit.runPkg", runPkgCommand),

    vscode.commands.registerCommand("rspit.open", openCommand),

    vscode.commands.registerCommand("rspit.packages.add", addPkgCommand),
  ];
};

const initializeTreeViews = (
  _context: vscode.ExtensionContext
): vscode.Disposable[] => {
  const pkgTreeViewProvider = new PkgTreeViewProvider();
  const pkgTreeView = vscode.window.createTreeView("rspitPackages", {
    treeDataProvider: pkgTreeViewProvider,
  });

  return [pkgTreeView];
};

const initializeCodeLens = (): vscode.Disposable => {
  return vscode.languages.registerCodeLensProvider(
    { language: "rust", pattern: "**/rspit.rs" },
    new CodeLensProvider()
  );
};

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    ...initializeCommands(context),
    ...initializeTreeViews(context),
    initializeCodeLens()
  );
}

export function deactivate() {}

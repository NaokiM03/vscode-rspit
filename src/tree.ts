import * as vscode from "vscode";

class Pkg extends vscode.TreeItem {
  iconPath = new vscode.ThemeIcon("package");
}

class PkgTreeProvider implements vscode.TreeDataProvider<Pkg> {
  getTreeItem(element: Pkg): vscode.TreeItem {
    return element;
  }

  getChildren(_element?: Pkg): vscode.ProviderResult<Pkg[]> {
    return [new Pkg("foo")];
  }
}

export function registerTrees() {
  const provider = new PkgTreeProvider();
  vscode.window.registerTreeDataProvider("rspitPackages", provider);
}

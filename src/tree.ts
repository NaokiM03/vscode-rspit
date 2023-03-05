import * as path from "path";
import * as child_process from "child_process";

import * as vscode from "vscode";

export * from "./tree/packages";

class Cache extends vscode.TreeItem {
  iconPath = new vscode.ThemeIcon("package");
}

export class CacheTreeViewProvider implements vscode.TreeDataProvider<Cache> {
  private readonly _onDidChangeTreeData =
    new vscode.EventEmitter<Cache | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Cache): vscode.TreeItem {
    return element;
  }

  getChildren(_element?: Cache): vscode.ProviderResult<Cache[]> {
    const dirPath = vscode.workspace
      .getConfiguration("rspit")
      .get("filePath") as string;
    const filePath = path.join(dirPath, "rspit.rs");

    return child_process
      .execSync(`pit list-caches ${filePath}`)
      .toString()
      .split("\n")
      .filter((x) => x !== "")
      .map((pkgName) => new Cache(pkgName));
  }
}

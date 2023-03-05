import * as path from "path";
import * as fs from "fs";
import * as child_process from "child_process";

import * as vscode from "vscode";

class CachedPackageTreeItem extends vscode.TreeItem {
  iconPath = new vscode.ThemeIcon("package");
}

// TODO: Naming
class CacheFileTreeItem extends vscode.TreeItem {
  readonly name: string;

  constructor(fileName: string) {
    super(fileName, vscode.TreeItemCollapsibleState.Expanded);

    this.name = fileName;
  }

  getChildren() {
    const dirPath = vscode.workspace
      .getConfiguration("rspit")
      .get("directoryPath") as string;
    const filePath = path.join(dirPath, this.name);

    return child_process
      .execSync(`pit list-caches ${filePath}`)
      .toString()
      .split("\n")
      .filter((x) => x !== "")
      .map((packageName) => new CachedPackageTreeItem(packageName));
  }
}

export class CachesTreeViewProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private readonly _onDidChangeTreeData =
    new vscode.EventEmitter<vscode.TreeItem | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: CacheFileTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(
    element?: CacheFileTreeItem
  ): vscode.ProviderResult<vscode.TreeItem[]> {
    if (element) {
      return element.getChildren();
    }

    const dirPath = vscode.workspace
      .getConfiguration("rspit")
      .get("directoryPath") as string;
    const contents = fs.readdirSync(dirPath).map((content) => {
      const name = content;
      const contentPath = path.join(dirPath, content);
      const stats = fs.statSync(contentPath);
      return { name, stats };
    });
    const fileNames = contents
      .filter((content) => content.stats.isFile())
      .map((content) => content.name);

    return fileNames.map((fileName) => {
      return new CacheFileTreeItem(fileName);
    });
  }
}

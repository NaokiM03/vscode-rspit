import * as path from "path";
import * as fs from "fs";
import * as child_process from "child_process";

import * as vscode from "vscode";

class CachedPackage extends vscode.TreeItem {
  iconPath = new vscode.ThemeIcon("package");
}

class CacheFile extends vscode.TreeItem {
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
      .map((pkgName) => new CachedPackage(pkgName));
  }
}

export class CacheTreeViewProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private readonly _onDidChangeTreeData =
    new vscode.EventEmitter<vscode.TreeItem | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: CacheFile): vscode.TreeItem {
    return element;
  }

  getChildren(element?: CacheFile): vscode.ProviderResult<vscode.TreeItem[]> {
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
      return { name, path: contentPath, stats };
    });
    const files = contents.filter((content) => content.stats.isFile());

    return files.map((file) => {
      return new CacheFile(file.name);
    });
  }
}

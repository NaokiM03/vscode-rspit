import * as path from "path";
import * as fs from "fs";

import * as vscode from "vscode";

import { Package, Packages } from "../package";

class PackageTreeItem extends vscode.TreeItem {
  constructor(fileName: string, packageName: string, range: vscode.Range) {
    super(packageName);

    this.iconPath = new vscode.ThemeIcon("package");
    this.command = {
      title: "Open package",
      command: "rspit.openPackage",
      arguments: [
        {
          fileName,
          range: new vscode.Range(range.start, range.start),
        },
      ],
    };
  }
}

export class RspitFileTreeItem extends vscode.TreeItem {
  readonly name: string;

  constructor(fileName: string) {
    super(fileName, vscode.TreeItemCollapsibleState.Expanded);

    this.name = fileName;
    this.contextValue = "file";
  }

  getChildren() {
    const dirPath = vscode.workspace
      .getConfiguration("rspit")
      .get("dirPath") as string;
    const filePath = path.join(dirPath, this.name);
    const fileContent = fs.readFileSync(filePath, "utf8");

    return new Packages(fileContent).map((x: Package) => {
      return new PackageTreeItem(this.name, x.name, x.codeLensRange);
    });
  }
}

export class PackagesTreeViewProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private readonly _onDidChangeTreeData =
    new vscode.EventEmitter<vscode.TreeItem | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: RspitFileTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(
    element?: RspitFileTreeItem
  ): vscode.ProviderResult<RspitFileTreeItem[]> {
    if (element) {
      return element.getChildren();
    }

    const dirPath = vscode.workspace
      .getConfiguration("rspit")
      .get("dirPath") as string;
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
      return new RspitFileTreeItem(fileName);
    });
  }
}

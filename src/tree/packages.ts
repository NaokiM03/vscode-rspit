import * as path from "path";
import * as fs from "fs";

import * as vscode from "vscode";

import { Snippets } from "../snippet";

class Pkg extends vscode.TreeItem {
  constructor(fileName: string, pkgName: string, range: vscode.Range) {
    super(pkgName);

    this.iconPath = new vscode.ThemeIcon("package");
    this.command = {
      title: "Open package",
      command: "rspit.openPkg",
      arguments: [
        {
          fileName,
          range: new vscode.Range(range.start, range.start),
        },
      ],
    };
  }
}

export class RspitFile extends vscode.TreeItem {
  readonly name: string;

  constructor(fileName: string, fileUri: vscode.Uri) {
    super(fileUri, vscode.TreeItemCollapsibleState.Expanded);

    this.name = fileName;
    this.contextValue = "file";
  }

  getChildren() {
    const dirPath = vscode.workspace
      .getConfiguration("rspit")
      .get("directoryPath") as string;
    const filePath = path.join(dirPath, this.name);
    const fileContent = fs.readFileSync(filePath, "utf8");

    return new Snippets(fileContent).map((snippet) => {
      return new Pkg(this.name, snippet.pkgName, snippet.codeLensRange);
    });
  }
}

export class PkgTreeViewProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private readonly _onDidChangeTreeData =
    new vscode.EventEmitter<vscode.TreeItem | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: RspitFile): vscode.TreeItem {
    return element;
  }

  getChildren(element?: RspitFile): vscode.ProviderResult<RspitFile[]> {
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
      const fileName = file.name;
      const fileUri = vscode.Uri.file(file.path);
      return new RspitFile(fileName, fileUri);
    });
  }
}

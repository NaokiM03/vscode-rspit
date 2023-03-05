import * as path from "path";
import * as fs from "fs";

import * as vscode from "vscode";

import { Snippets } from "./snippet";

class Pkg extends vscode.TreeItem {
  constructor(pkgName: string, range: vscode.Range) {
    super(pkgName);

    this.iconPath = new vscode.ThemeIcon("package");
    this.command = {
      title: "Open package",
      command: "rspit.openPkg",
      arguments: [
        {
          range: new vscode.Range(range.start, range.start),
        },
      ],
    };
  }
}

export class PkgTreeViewProvider implements vscode.TreeDataProvider<Pkg> {
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<Pkg | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Pkg): vscode.TreeItem {
    return element;
  }

  getChildren(_element?: Pkg): vscode.ProviderResult<Pkg[]> {
    const dirPath = vscode.workspace
      .getConfiguration("rspit")
      .get("filePath") as string;
    const filePath = path.join(dirPath, "rspit.rs");
    const fileContent = fs.readFileSync(filePath, "utf8");

    return new Snippets(fileContent).map((snippet) => {
      return new Pkg(snippet.pkgName, snippet.codeLensRange);
    });
  }
}

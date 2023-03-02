import * as path from "path";
import * as fs from "fs";

import * as vscode from "vscode";

import * as TOML from "@iarna/toml";

class Pkg extends vscode.TreeItem {
  iconPath = new vscode.ThemeIcon("package");
}

type Line = {
  content: string;
  number: number;
};

const toLine = (s: string, i: number): Line => ({ content: s, number: i });

const splitLinesByPkg = (
  acc: Line[][],
  x: Line,
  i: number,
  lines: Line[]
): Line[][] => {
  if (i === 0) {
    acc.push([]);
    acc[acc.length - 1].push(x);
    return acc;
  }

  if (x.content.startsWith("//# ---")) {
    acc.push([]);
    return acc;
  }

  if (lines[i - 1].content.startsWith("//# ---") && x.content === "") {
    return acc;
  }

  acc[acc.length - 1].push(x);
  return acc;
};

function extractPkgName(lines: Line[]): string {
  const t: string = lines
    .filter((line) => line.content.startsWith("//# "))
    .map((line) => line.content.substring(4))
    .join("\n");

  let toml: TOML.JsonMap;
  try {
    toml = TOML.parse(t);
  } catch (e) {
    throw e;
  }

  const pkgField = toml.package as TOML.JsonMap;
  return pkgField.name as string;
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
    const textEditor = vscode.window.activeTextEditor;
    if (textEditor === undefined) {
      return Promise.resolve([]);
    }
    if (!textEditor.document.fileName.endsWith("rspit.rs")) {
      return Promise.resolve([]);
    }

    const dirPath = vscode.workspace
      .getConfiguration("rspit")
      .get("filePath") as string;
    const filePath = path.join(dirPath, "rspit.rs");
    const snippets = fs.readFileSync(filePath, "utf8");

    return snippets
      .split("\n")
      .map(toLine)
      .reduce(splitLinesByPkg, [])
      .map((lines: Line[]) => {
        const pkgName = extractPkgName(lines);
        return new Pkg(pkgName);
      });
  }
}

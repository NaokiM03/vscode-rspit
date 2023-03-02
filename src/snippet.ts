import * as vscode from "vscode";

import * as TOML from "@iarna/toml";

type Line = {
  content: string;
  number: number;
};

type Snippet = {
  pkgName: string;
  codeLensRange: vscode.Range;
};

export class Snippets {
  inner: Snippet[];

  private toLine = (s: string, i: number): Line => ({ content: s, number: i });

  private splitLinesByPkg = (
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

  private extractPkgName = (lines: Line[]): string => {
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
  };

  private findCodeLensRange = (lines: Line[]): vscode.Range => {
    const targetLine = lines.find(
      (line) => line.content.match(/^fn main\(\)+\s/) !== null
    ) as Line;

    return new vscode.Range(
      new vscode.Position(targetLine.number, 0),
      new vscode.Position(targetLine.number, targetLine.content.length)
    );
  };

  constructor(src: string) {
    this.inner = src
      .split("\n")
      .map(this.toLine)
      .reduce(this.splitLinesByPkg, [])
      .map((lines) => {
        const pkgName = this.extractPkgName(lines);
        const range = this.findCodeLensRange(lines);

        return { pkgName: pkgName, codeLensRange: range };
      });
  }

  map(callback: (v: Snippet) => any): any[] {
    return this.inner.map(callback);
  }
}

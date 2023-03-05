import * as vscode from "vscode";

import * as TOML from "@iarna/toml";

type Line = {
  content: string;
  number: number;
};

export type Package = {
  name: string;
  codeLensRange: vscode.Range;
};

export class Packages {
  inner: Package[];

  private toLine = (s: string, i: number): Line => ({ content: s, number: i });

  private splitLinesByPackage = (
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

  private extractPackageName = (lines: Line[]): string => {
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

    const packageField = toml.package as TOML.JsonMap;
    return packageField.name as string;
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
      .reduce(this.splitLinesByPackage, [])
      .map((lines) => {
        const name = this.extractPackageName(lines);
        const codeLensRange = this.findCodeLensRange(lines);

        return { name, codeLensRange };
      });
  }

  map(callback: (v: Package) => any): any[] {
    return this.inner.map(callback);
  }
}

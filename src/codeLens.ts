import * as vscode from "vscode";

import * as TOML from "@iarna/toml";

type Line = {
  content: string;
  number: number;
};

type RunPkgArg = {
  filePath: string;
  pkg: string;
};

export class CodeLensProvider implements vscode.CodeLensProvider {
  constructor() {}

  public provideCodeLenses(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    return document
      .getText()
      .split("\n")
      .map((s: string, i: number) => ({ content: s, number: i }))
      .reduce((acc: Line[][], v: Line, i, lines: Line[]) => {
        if (i === 0) {
          acc.push([v]);
          return acc;
        }

        if (v.content.startsWith("//# ---")) {
          acc.push([]);
          return acc;
        }

        if (lines[i - 1].content.startsWith("//# ---") && v.content === "") {
          return acc;
        }

        acc[acc.length - 1].push(v);
        return acc;
      }, [])
      .map((lines: Line[]) => {
        let toml: TOML.JsonMap;
        try {
          const t: string = lines
            .filter((line) => line.content.startsWith("//# "))
            .map((line) => line.content.substring(4))
            .join("\n");
          toml = TOML.parse(t);
        } catch (e) {
          throw e;
        }

        const pkgField = toml.package as TOML.JsonMap;
        const pkgName = pkgField.name as string;

        const targetLine = lines.find(
          (line) => line.content.match(/^fn main\(\)+\s/) !== null
        ) as Line;

        const range = new vscode.Range(
          new vscode.Position(targetLine.number, 0),
          new vscode.Position(targetLine.number, targetLine.content.length)
        );

        const arg: RunPkgArg = {
          filePath: document.fileName,
          pkg: pkgName,
        };

        return new vscode.CodeLens(range, {
          title: "▶ Run",
          command: "rspit.runPkg",
          tooltip: `Run ${pkgName} package`,
          arguments: [arg],
        });
      });
  }
}

import * as vscode from "vscode";

import * as TOML from "@iarna/toml";

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

function findCodeLensRange(lines: Line[]): vscode.Range {
  const targetLine = lines.find(
    (line) => line.content.match(/^fn main\(\)+\s/) !== null
  ) as Line;

  return new vscode.Range(
    new vscode.Position(targetLine.number, 0),
    new vscode.Position(targetLine.number, targetLine.content.length)
  );
}

function createCommand(fileName: string, pkgName: string): vscode.Command {
  return {
    title: "▶ Run",
    command: "rspit.runPkg",
    tooltip: `Run ${pkgName} package`,
    arguments: [
      {
        filePath: fileName,
        pkg: pkgName,
      },
    ],
  };
}

class CodeLensProvider implements vscode.CodeLensProvider {
  constructor() {}

  public provideCodeLenses(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    const snippets: string = document.getText();
    const filePath: string = document.fileName;

    return snippets
      .split("\n")
      .map(toLine)
      .reduce(splitLinesByPkg, [])
      .map((lines: Line[]) => {
        const pkgName = extractPkgName(lines);
        const range = findCodeLensRange(lines);
        const command = createCommand(filePath, pkgName);

        return new vscode.CodeLens(range, command);
      });
  }
}

export function createCodeLensProviderDisposable(): vscode.Disposable {
  return vscode.languages.registerCodeLensProvider(
    { language: "rust", pattern: "**/rspit.rs" },
    new CodeLensProvider()
  );
}

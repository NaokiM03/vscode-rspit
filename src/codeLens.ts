import * as vscode from "vscode";

import { Snippets } from "./snippet";

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

export class CodeLensProvider implements vscode.CodeLensProvider {
  constructor() {}

  public provideCodeLenses(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    const fileContent: string = document.getText();
    const filePath: string = document.fileName;

    return new Snippets(fileContent).map((snippet) => {
      const command = createCommand(filePath, snippet.pkgName);

      return new vscode.CodeLens(snippet.codeLensRange, command);
    });
  }
}

import * as vscode from "vscode";

import { Snippets } from "./snippet";

export class CodeLensProvider implements vscode.CodeLensProvider {
  constructor() {}

  public provideCodeLenses(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    const fileContent: string = document.getText();
    const filePath: string = document.fileName;

    return new Snippets(fileContent).map((snippet) => {
      const pkgName = snippet.pkgName;
      const range = snippet.codeLensRange;
      const command = {
        title: "▶ Run",
        command: "rspit.runPkg",
        tooltip: `Run ${pkgName} package`,
        arguments: [
          {
            filePath,
            pkgName: pkgName,
          },
        ],
      };

      return new vscode.CodeLens(range, command);
    });
  }
}

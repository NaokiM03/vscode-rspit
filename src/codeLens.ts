import * as vscode from "vscode";

import { Package, Packages } from "./package";

export class CodeLensProvider implements vscode.CodeLensProvider {
  constructor() {}

  public provideCodeLenses(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    const fileContent: string = document.getText();
    const filePath: string = document.fileName;

    return new Packages(fileContent).map((x: Package) => {
      const packageName = x.name;
      const range = x.codeLensRange;
      const command = {
        title: "▶ Run",
        command: "rspit.runPackage",
        tooltip: `Run ${packageName} package`,
        arguments: [
          {
            filePath,
            packageName,
          },
        ],
      };

      return new vscode.CodeLens(range, command);
    });
  }
}

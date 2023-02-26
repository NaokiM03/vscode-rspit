import * as vscode from "vscode";

import { CodeLensProvider } from "./codeLens";

type RunPkgArg = {
  filePath: string;
  pkg: string;
};

export function activate(context: vscode.ExtensionContext) {
  let runPkgDisposable = vscode.commands.registerCommand(
    "rspit.runPkg",
    async (arg: RunPkgArg) => {
      // Save package before run.
      await vscode.commands.executeCommand("workbench.action.files.save");
      // Clear terminal before run.
      await vscode.commands.executeCommand("workbench.action.terminal.clear");

      const task = new vscode.Task(
        { type: "rspit" },
        vscode.TaskScope.Workspace,
        "rspit run",
        "rspit",
        new vscode.ShellExecution(
          `pit run ${arg.filePath} --package ${arg.pkg}`
        ),
        []
      );
      try {
        vscode.tasks.executeTask(task);
      } catch (e) {
        throw e;
      }
    }
  );

  const codeLensProvider = new CodeLensProvider();
  const codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
    { language: "rust" },
    codeLensProvider
  );

  context.subscriptions.push(runPkgDisposable);
  context.subscriptions.push(codeLensProviderDisposable);
}

export function deactivate() {}

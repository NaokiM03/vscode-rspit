import * as vscode from "vscode";

type RunPkgArg = {
  filePath: string;
  pkg: string;
};

export function createRunPkgCommandDisposable(): vscode.Disposable {
  return vscode.commands.registerCommand(
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
}

import * as path from "path";

import * as vscode from "vscode";

import * as child_process from "child_process";

export function createRunPkgCommandDisposable(): vscode.Disposable {
  function createRunPkgTask(filePath: string, pkg: string) {
    const taskDefinition: vscode.TaskDefinition = { type: "rspit" };
    const scope: vscode.TaskScope.Workspace = vscode.TaskScope.Workspace;
    const name: string = "rspit run";
    const source: string = "rspit";
    const execution = new vscode.ShellExecution(
      `pit run ${filePath} --package ${pkg}`
    );
    const problemMatchers = undefined;

    return new vscode.Task(
      taskDefinition,
      scope,
      name,
      source,
      execution,
      problemMatchers
    );
  }

  const command = "rspit.runPkg";
  const callback = async (arg: { filePath: string; pkg: string }) => {
    // Save package before run.
    await vscode.commands.executeCommand("workbench.action.files.save");
    // Clear terminal before run.
    await vscode.commands.executeCommand("workbench.action.terminal.clear");

    const task = createRunPkgTask(arg.filePath, arg.pkg);
    try {
      await vscode.tasks.executeTask(task);
    } catch (e) {
      throw e;
    }
  };

  return vscode.commands.registerCommand(command, callback);
}

export function createOpenCommandDisposable(): vscode.Disposable {
  return vscode.commands.registerCommand("rspit.open", () => {
    const dirPath = vscode.workspace
      .getConfiguration("rspit")
      .get("filePath") as string;
    const filePath = path.join(dirPath, "rspit.rs");
    const fileUri = vscode.Uri.file(filePath);

    vscode.commands.executeCommand("vscode.open", fileUri);
  });
}

export function createAddPkgCommandDisposable(): vscode.Disposable {
  return vscode.commands.registerCommand("rspit.packages.add", () => {
    const dirPath = vscode.workspace
      .getConfiguration("rspit")
      .get("filePath") as string;
    const filePath = path.join(dirPath, "rspit.rs");
    child_process.exec(`pit add ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });
  });
}

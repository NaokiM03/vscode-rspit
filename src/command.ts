import * as path from "path";

import * as vscode from "vscode";

import * as child_process from "child_process";

import { Globals } from "./globals";
import { RspitFile } from "./tree/packages";

const createRunPkgTask = (filePath: string, pkgName: string): vscode.Task => {
  const taskDefinition: vscode.TaskDefinition = { type: "rspit" };
  const scope: vscode.TaskScope.Workspace = vscode.TaskScope.Workspace;
  const name: string = "RSPIT RUN";
  const source: string = "rspit";
  const execution = new vscode.ShellExecution(
    `pit run ${filePath} --package ${pkgName}`
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
};

export const runPkgCommand = (globals: Globals) => {
  return async (arg: { filePath: string; pkgName: string }) => {
    // Save package before run.
    await vscode.commands.executeCommand("workbench.action.files.save");
    // Clear terminal before run.
    await vscode.commands.executeCommand("workbench.action.terminal.clear");

    const task = createRunPkgTask(arg.filePath, arg.pkgName);
    vscode.tasks.onDidEndTask((e) => {
      if (e.execution.task.name === task.name) {
        globals.dispatchEvent("refreshCache");
      }
    });
    try {
      await vscode.tasks.executeTask(task);
    } catch (e) {
      throw e;
    }
  };
};

export const openCommand = () => {
  const dirPath = vscode.workspace
    .getConfiguration("rspit")
    .get("filePath") as string;
  const filePath = path.join(dirPath, "rspit.rs");
  const fileUri = vscode.Uri.file(filePath);

  vscode.commands.executeCommand("vscode.open", fileUri);
};

export const openPkgCommand = (arg: {
  fileName: string;
  range: vscode.Range;
}) => {
  const dirPath = vscode.workspace
    .getConfiguration("rspit")
    .get("filePath") as string;
  const filePath = path.join(dirPath, arg.fileName);
  const fileUri = vscode.Uri.file(filePath);

  const options: vscode.TextDocumentShowOptions = {
    selection: arg.range,
  };
  vscode.window.showTextDocument(fileUri, options);
};

export const addPkgCommand = (globals: Globals) => {
  return (rspitFile: RspitFile) => {
    const dirPath = vscode.workspace
      .getConfiguration("rspit")
      .get("filePath") as string;
    const filePath = path.join(dirPath, rspitFile.name);
    child_process.execSync(`pit add ${filePath}`);

    globals.dispatchEvent("refreshPkg");
  };
};

export const refreshPkgCommand = (globals: Globals) => {
  return () => {
    globals.dispatchEvent("refreshPkg");
  };
};

export const refreshCacheCommand = (globals: Globals) => {
  return () => {
    globals.dispatchEvent("refreshCache");
  };
};

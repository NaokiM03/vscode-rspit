import * as path from "path";

import * as vscode from "vscode";

import * as child_process from "child_process";

import { Globals } from "./globals";

const createRunPkgTask = (filePath: string, pkg: string): vscode.Task => {
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
};

export const runPkgCommand = async (arg: { filePath: string; pkg: string }) => {
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

export const openCommand = () => {
  const dirPath = vscode.workspace
    .getConfiguration("rspit")
    .get("filePath") as string;
  const filePath = path.join(dirPath, "rspit.rs");
  const fileUri = vscode.Uri.file(filePath);

  vscode.commands.executeCommand("vscode.open", fileUri);
};

export const addPkgCommand = (globals: Globals) => {
  return () => {
    const dirPath = vscode.workspace
      .getConfiguration("rspit")
      .get("filePath") as string;
    const filePath = path.join(dirPath, "rspit.rs");
    child_process.execSync(`pit add ${filePath}`);

    globals.dispatchEvent("refresh");
  };
};

import * as path from "path";
import * as fs from "fs";
import * as child_process from "child_process";

import * as vscode from "vscode";

import { Globals } from "./globals";
import { RspitFileTreeItem } from "./tree/packages";

const createRunPackageTask = (
  filePath: string,
  packageName: string
): vscode.Task => {
  const taskDefinition: vscode.TaskDefinition = { type: "rspit" };
  const scope: vscode.TaskScope.Workspace = vscode.TaskScope.Workspace;
  const name: string = "RSPIT RUN";
  const source: string = "rspit";
  const execution = new vscode.ShellExecution(
    `pit run ${filePath} --package ${packageName}`
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

export const runPackageCommand = (globals: Globals) => {
  return async (arg: { filePath: string; packageName: string }) => {
    // Save package before run.
    await vscode.commands.executeCommand("workbench.action.files.save");
    // Clear terminal before run.
    await vscode.commands.executeCommand("workbench.action.terminal.clear");

    const task = createRunPackageTask(arg.filePath, arg.packageName);
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

export const openCommand = async () => {
  const dirPath = vscode.workspace
    .getConfiguration("rspit")
    .get("dirPath") as string;
  const contents = fs.readdirSync(dirPath).map((content) => {
    const name = content;
    const contentPath = path.join(dirPath, content);
    const stats = fs.statSync(contentPath);
    return { name, stats };
  });
  const fileNames = contents
    .filter((content) => content.stats.isFile())
    .map((content) => content.name);

  const fileName = await vscode.window.showQuickPick(fileNames);
  if (!fileName) return;

  const filePath = path.join(dirPath, fileName);
  const fileUri = vscode.Uri.file(filePath);

  vscode.commands.executeCommand("vscode.open", fileUri);
};

export const newCommand = (globals: Globals) => {
  return async () => {
    const dirPath = vscode.workspace
      .getConfiguration("rspit")
      .get("dirPath") as string;
    const contents = fs.readdirSync(dirPath).map((content) => {
      const name = content;
      const contentPath = path.join(dirPath, content);
      const stats = fs.statSync(contentPath);
      return { name, stats };
    });
    const fileNames = contents
      .filter((content) => content.stats.isFile())
      .map((content) => content.name);

    const fileName = await vscode.window.showInputBox({
      prompt: "Enter file name",
      title: "Create new file",
      validateInput: async (fileName) => {
        if (fileNames.includes(fileName)) {
          return `Error: Cannot create ${fileName} bacause another file exists with the same name`;
        }

        return null;
      },
    });
    if (!fileName) return;

    child_process.execSync(`pit init --out-dir ${dirPath} ${fileName}`);

    globals.dispatchEvent("refreshPackage");
    globals.dispatchEvent("refreshCache");
  };
};

export const openPackageCommand = (arg: {
  fileName: string;
  range: vscode.Range;
}) => {
  const dirPath = vscode.workspace
    .getConfiguration("rspit")
    .get("dirPath") as string;
  const filePath = path.join(dirPath, arg.fileName);
  const fileUri = vscode.Uri.file(filePath);

  const options: vscode.TextDocumentShowOptions = {
    selection: arg.range,
  };
  vscode.window.showTextDocument(fileUri, options);
};

export const addPackageCommand = (globals: Globals) => {
  return (rspitFile: RspitFileTreeItem) => {
    const dirPath = vscode.workspace
      .getConfiguration("rspit")
      .get("dirPath") as string;
    const filePath = path.join(dirPath, rspitFile.name);
    child_process.execSync(`pit add ${filePath}`);

    globals.dispatchEvent("refreshPackage");
  };
};

export const refreshPackageCommand = (globals: Globals) => {
  return () => {
    globals.dispatchEvent("refreshPackage");
  };
};

export const refreshCacheCommand = (globals: Globals) => {
  return () => {
    globals.dispatchEvent("refreshCache");
  };
};

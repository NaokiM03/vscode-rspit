import * as vscode from "vscode";

import { createCodeLensProviderDisposable } from "./codeLens";
import { createRunPkgCommandDisposable } from "./command";

export function activate(context: vscode.ExtensionContext) {
  const runPkgDisposable = createRunPkgCommandDisposable();

  const codeLensProviderDisposable = createCodeLensProviderDisposable();

  context.subscriptions.push(runPkgDisposable);
  context.subscriptions.push(codeLensProviderDisposable);
}

export function deactivate() {}

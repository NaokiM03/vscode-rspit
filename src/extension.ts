import * as vscode from "vscode";

import { createCodeLensProviderDisposable } from "./codeLens";
import { createRunPkgCommandDisposable } from "./command";

export function activate(context: vscode.ExtensionContext) {
  const runPkgCommandDisposable = createRunPkgCommandDisposable();
  const codeLensProviderDisposable = createCodeLensProviderDisposable();

  context.subscriptions.push(runPkgCommandDisposable);
  context.subscriptions.push(codeLensProviderDisposable);
}

export function deactivate() {}

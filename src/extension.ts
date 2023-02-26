import * as vscode from "vscode";

import { createCodeLensProviderDisposable } from "./codeLens";
import {
  createOpenCommandDisposable,
  createRunPkgCommandDisposable,
} from "./command";

export function activate(context: vscode.ExtensionContext) {
  const runPkgCommandDisposable = createRunPkgCommandDisposable();
  const openCommnandDisposable = createOpenCommandDisposable();
  const codeLensProviderDisposable = createCodeLensProviderDisposable();

  context.subscriptions.push(runPkgCommandDisposable);
  context.subscriptions.push(openCommnandDisposable);
  context.subscriptions.push(codeLensProviderDisposable);
}

export function deactivate() {}

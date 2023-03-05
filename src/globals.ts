import * as vscode from "vscode";

type Event = "refreshPackage" | "refreshCache";
type EventCallback = (event: Event) => void;

export interface Globals {
  readonly context: vscode.ExtensionContext;
  listenEvent(callback: EventCallback): vscode.Disposable;
  dispatchEvent(event: Event): void;
}

export const newGlobals = (context: vscode.ExtensionContext): Globals => {
  const callbacks = new Set<EventCallback>();
  return {
    context,
    listenEvent: (callback) => {
      callbacks.add(callback);
      return { dispose: () => callbacks.delete(callback) };
    },
    dispatchEvent: (event) => {
      callbacks.forEach((callback) => callback(event));
    },
  };
};

import * as vscode from "vscode";


export class  TextDocumentMock implements  vscode.TextDocument {
    uri!: vscode.Uri;
    fileName: string = "";
    isUntitled: boolean = false;
    languageId: string = "";
    version: number = 0;
    isDirty: boolean = false;
    isClosed: boolean = true;
    save(): Thenable<boolean> {
        throw new Error("Method not implemented.");
    }
    eol: vscode.EndOfLine = vscode.EndOfLine.CRLF;
    lineCount!: number;
    lineAt(line: number): vscode.TextLine;
    lineAt(position: vscode.Position): vscode.TextLine;
    lineAt(position: any): vscode.TextLine {
        throw new Error("Method not implemented.");
    }
    offsetAt(position: vscode.Position): number {
        throw new Error("Method not implemented.");
    }
    positionAt(offset: number): vscode.Position {
        throw new Error("Method not implemented.");
    }
    getText(range?: vscode.Range | undefined): string {
        throw new Error("Method not implemented.");
    }
    getWordRangeAtPosition(position: vscode.Position, regex?: RegExp | undefined): vscode.Range | undefined {
        throw new Error("Method not implemented.");
    }
    validateRange(range: vscode.Range): vscode.Range {
        throw new Error("Method not implemented.");
    }
    validatePosition(position: vscode.Position): vscode.Position {
        throw new Error("Method not implemented.");
    }
}
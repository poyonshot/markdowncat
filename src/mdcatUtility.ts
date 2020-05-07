import * as vscode from "vscode";
import * as path from "path";

export function extractExtentision(filepath: string): string
{
    let ext = path.extname(filepath).toLocaleLowerCase();
    return (ext.charAt(0) === ".") ? ext.slice(1) : "";
}

export function getEOL(doc: vscode.TextDocument): string
{
    return (doc.eol == vscode.EndOfLine.CRLF) ? "\r\n" : "\n";
}
import * as vscode from "vscode";


export default class MdcatCompletionProvider implements vscode.CompletionItemProvider {
    
    constructor () {
    }

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        var items = new Array<vscode.CompletionItem>();
        items.push(new vscode.CompletionItem("include"));

        // {
        //     let item = new vscode.CompletionItem("NewPage");
        //     item.insertText = '<div style="page-break-before:always"></div>';
        //     items.push(item);
        // }

        return items;
    }

    resolveCompletionItem (item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
        return undefined
    }
}
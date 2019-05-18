import * as vscode from "vscode";
import * as path from "path";


export default class FilePathCompletionProvider implements vscode.CompletionItemProvider {
    
    items: Array<vscode.CompletionItem>;

    constructor () {
        this.items = new Array<vscode.CompletionItem>();
    }

    searchFiles() {

        this.items = new Array<vscode.CompletionItem>();

        // add folders
        let rootPathLen = vscode.workspace.rootPath!.length + 2;

        let targetItems = ["md", "css"];

        // add markdown files
        vscode.workspace.findFiles("**/*.*").then((urls) => {
            return urls.map((url) => {
                return url.path.substr(rootPathLen)!

                //return path.basename(url.path)
            })
        }).then((filenames) => {
            filenames.map((filename) => {
                const ext = path.extname(filename).toLocaleLowerCase()
                if (targetItems.indexOf(ext)) {
                    let item = new vscode.CompletionItem(filename);
                    item.kind = vscode.CompletionItemKind.File;
                    item.insertText = '"' + filename + '"';
                    this.items.push(item);
                }
            })
        })
    }

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        return this.items;
    }

    resolveCompletionItem (item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
        return undefined
    }
}
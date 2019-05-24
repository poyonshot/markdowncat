import * as vscode from "vscode";
import * as path from "path";


export default class FilePathCompletionProvider implements vscode.CompletionItemProvider {
    
    public static includeExts: Array<String> = [];
    items: Array<vscode.CompletionItem>;

    constructor () {
        this.items = new Array<vscode.CompletionItem>();
    }

    searchFiles() {

        let editor = vscode.window.activeTextEditor;
        if (!editor)
        {
            return
        }
        
        this.items = new Array<vscode.CompletionItem>();
    
        let rootPath = path.dirname(editor.document.fileName) + "\\";

        // add markdown files
        vscode.workspace.findFiles("**/*.*").then((urls) => {
            return urls.map((url) => {
                return (url.fsPath.substr(0, rootPath.length)! === rootPath) ? url.fsPath.substr(rootPath.length)! : "";
            })
            .filter((item) => {
                return item.length > 0;
            })
        }).then((filenames) => {
            filenames.map((filename) => {
                const ext = path.extname(filename).toLocaleLowerCase();
                const n  = FilePathCompletionProvider.includeExts.indexOf(ext);
                if (n >= 0) {
                    let item = new vscode.CompletionItem(filename);
                    item.kind = vscode.CompletionItemKind.File;
                    item.insertText = '"' + filename + '"';
                    this.items.push(item);
                }
            })
        })
    }

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        let begin = new vscode.Position(position.line, 0);
        let src = document.getText(new vscode.Range(begin, position))
        let regEx = /.*\$include[^=]*=$/g;
        return regEx.exec(src) ? this.items : [];
    }

    resolveCompletionItem (item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
        return undefined
    }
}
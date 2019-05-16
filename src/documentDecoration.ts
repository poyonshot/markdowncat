import * as vscode from "vscode";

export default class DocumentDecoration
{
    private timeout: NodeJS.Timer | undefined = undefined;

    public static commentColor = "";

    public update() {
        
        const lineCommentDecorationType = vscode.window.createTextEditorDecorationType({
            color: DocumentDecoration.commentColor
        });

        let editor = vscode.window.activeTextEditor; // エディタ取得
        if (!editor) {
            return;
        }
        const regEx = /\/\*[\s\S]*?\*\/|\/\/.*/g;
        const text = editor.document.getText();
        const lineComment: vscode.DecorationOptions[] = [];
        const largeNumbers: vscode.DecorationOptions[] = [];
        let match;
        while (match = regEx.exec(text)) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            const decoration = { range: new vscode.Range(startPos, endPos) };
            lineComment.push(decoration);
        }
        editor.setDecorations(lineCommentDecorationType, lineComment);
    }

    public triggerUpdateDecorations() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
        this.timeout = setTimeout(this.update, 500);
    }
}
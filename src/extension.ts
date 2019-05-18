import * as vscode from 'vscode';
import { workspace } from "vscode";
import DocumentDecoration from "./documentDecoration";
import expandMdcatFile from "./expandMdcat"
import insertNewPage from "./insertNewPage"
import MdcatCompletionProvider from "./mdcatCompletionProvider"
import FilePathCompletionProvider from "./filePathCompletionProvider"
import { print } from 'util';


export function activate(context: vscode.ExtensionContext) {
	
	var colorComment = vscode.workspace.getConfiguration().get('markdowncat.color.comment');
	if (typeof colorComment === "string") {
		if (colorComment.toLowerCase() === "auto") {
			const val = vscode.workspace.getConfiguration().get('editor.tokenColorCustomizations.comments');
			if (typeof val === "string"){
				colorComment = val;
			}
			else {
				colorComment = {};
			}
		}
	}
	DocumentDecoration.commentColor = (typeof colorComment === "string") ? colorComment : "#30F030";

	//ドキュメントオープン時にアクティベーションしているので、この時点でドキュメントを装飾する
	(new DocumentDecoration()).update(vscode.window.activeTextEditor);

	let filePathCompletion = new FilePathCompletionProvider()
	filePathCompletion.searchFiles()

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.expandMdcat', expandMdcatFile),
		vscode.commands.registerCommand('extension.insertNewPage', insertNewPage),
		
		vscode.window.onDidChangeActiveTextEditor((event) => {
			if (!event || (event.document.languageId !== "poyonshotmdcat")) {
				return;
			}
			(new DocumentDecoration()).update(event);
			filePathCompletion.searchFiles()
		}),
		
		vscode.languages.registerCompletionItemProvider("poyonshotmdcat", new MdcatCompletionProvider(), '$'),
		vscode.languages.registerCompletionItemProvider("poyonshotmdcat", filePathCompletion, '='),
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}

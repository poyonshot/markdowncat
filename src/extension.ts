import * as vscode from 'vscode';
import { workspace } from "vscode";
import DocumentDecoration from "./documentDecoration";
import expandMdcatFile from "./expandMdcat"
import insertNewPage from "./insertNewPage"
import MdcatCompletionProvider from "./mdcatCompletionProvider"
import FilePathCompletionProvider from "./filePathCompletionProvider"
import { print } from 'util';


function initConfig() {
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

	
	var includeExts = vscode.workspace.getConfiguration().get('markdowncat.intellisense.includeExts');
	if (includeExts instanceof Array) {
		FilePathCompletionProvider.includeExts = includeExts;
	}
}


export function activate(context: vscode.ExtensionContext) {
	
	initConfig()

	var  curEditor = vscode.window.activeTextEditor;

	//ドキュメントオープン時にアクティベーションしているので、この時点でドキュメントを装飾する
	let documentDecoration = new DocumentDecoration();
	documentDecoration.requestUpdate(curEditor, 0);

	let filePathCompletion = new FilePathCompletionProvider()
	filePathCompletion.searchFiles()


	context.subscriptions.push(
		vscode.commands.registerCommand('extension.expandMdcat', expandMdcatFile),
		vscode.commands.registerCommand('extension.insertNewPage', insertNewPage),
		vscode.languages.registerCompletionItemProvider("poyonshotmdcat", new MdcatCompletionProvider(), '$'),
		vscode.languages.registerCompletionItemProvider("poyonshotmdcat", filePathCompletion, '='),
		
		vscode.window.onDidChangeActiveTextEditor((event) => {
			curEditor = event;
			if (!event || (event.document.languageId !== "poyonshotmdcat")) {
				return;
			}
			documentDecoration.requestUpdate(curEditor, 0);
			filePathCompletion.searchFiles()
		}),

		workspace.onDidChangeTextDocument((event) => {
			documentDecoration.requestUpdate(curEditor, 200);
		}),
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}

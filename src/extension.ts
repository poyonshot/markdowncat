// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { workspace } from "vscode";
import DocumentDecoration from "./documentDecoration";
import expandMdcatFile from "./expandMdcat"
import insertNewPage from "./insertNewPage"
import MdcatCompletionProvider from "./mdcatCompletionProvider"
import FilePathCompletionProvider from "./filePathCompletionProvider"
import { print } from 'util';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	//console.log('Congratulations, your extension "markdowncat" is now active!');
	
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
	DocumentDecoration.commentColor = (typeof colorComment === "string") ? colorComment : "#00AA00";


	let filePathCompletion = new FilePathCompletionProvider()
	filePathCompletion.searchFiles()

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.expandMdcat', expandMdcatFile),
		vscode.commands.registerCommand('extension.insertNewPage', insertNewPage),
	
		workspace.onDidOpenTextDocument((event) => {
			(new DocumentDecoration()).update();
		}),

		vscode.languages.registerCompletionItemProvider("poyonshotmdcat", new MdcatCompletionProvider(), '$'),
		vscode.languages.registerCompletionItemProvider("poyonshotmdcat", filePathCompletion, '='),
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}

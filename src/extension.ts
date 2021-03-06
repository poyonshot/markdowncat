import * as vscode from 'vscode';
import { workspace } from "vscode";
import DocumentDecoration from "./documentDecoration";
import expandMdcatFile from "./expandMdcatFile";
import insertNewPage from "./insertNewPage";
import insertSettings from "./insertSettings";
import MdcatCompletionProvider from "./mdcatCompletionProvider";
import FilePathCompletionProvider from "./filePathCompletionProvider";
import { ExpandMdcat } from './ExpandMdcat';
import { MdcatSettings } from './MdcatSettings';


function initConfig() {
	var colorComment = vscode.workspace.getConfiguration().get('markdowncat.color.comment');
	if (typeof colorComment === "string") {
		let color = colorComment.toLowerCase();
		if ((color == "auto") || (color == "")) 
		{
			const val = vscode.workspace.getConfiguration().get('editor.tokenColorCustomizations.comments');
			if (typeof val === "string"){
				color = val;
			}
			else {
				color = "";
			}
		}
		if (color == "")
		{
			color =  "#30F030";
		}
		DocumentDecoration.commentColor = color;
	}
	
	var includeExts = vscode.workspace.getConfiguration().get('markdowncat.intellisense.includeExts');
	if (includeExts instanceof Array) {
		FilePathCompletionProvider.includeExts = includeExts;
	}
}




export function activate(context: vscode.ExtensionContext) {
	
	initConfig();

	var curEditor = vscode.window.activeTextEditor;

	//ドキュメントオープン時にアクティベーションしているので、この時点でドキュメントを装飾する
	let documentDecoration = new DocumentDecoration();
	documentDecoration.requestUpdate(curEditor, 0);

	let filePathCompletion = new FilePathCompletionProvider();
	filePathCompletion.searchFiles();


	context.subscriptions.push(
		vscode.commands.registerCommand('extension.expandMdcat', expandMdcatFile),
		vscode.commands.registerCommand('extension.insertNewPage', insertNewPage),
		vscode.commands.registerCommand('extension.insertSettings', insertSettings),
		
		vscode.languages.registerCompletionItemProvider("poyonshotmdcat", new MdcatCompletionProvider(), '$'),
		vscode.languages.registerCompletionItemProvider("poyonshotmdcat", filePathCompletion, '='),
		
		vscode.window.onDidChangeActiveTextEditor((event) => {
			curEditor = event;
			if (!event || (event.document.languageId !== "poyonshotmdcat")) {
				return;
			}
			documentDecoration.requestUpdate(curEditor, 0);
			filePathCompletion.searchFiles();
		}),

		workspace.onDidChangeTextDocument((event) => {
			documentDecoration.requestUpdate(curEditor, 200);
		}),
	);

	let settings = new MdcatSettings();
	settings.loadConfiguration();

	return {
		extendMarkdownIt(md: any) {
			ExpandMdcat.mdIt = md;			
			return md.use(require("markdown-it-mdcat-table"), { codeBlockName: settings.mdcatTableName});
		}
	};
}

// this method is called when your extension is deactivated
export function deactivate() {}

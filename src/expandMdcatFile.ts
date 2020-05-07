import * as vscode from "vscode";
import { ExpandMdcat } from "./ExpandMdcat";


export default function expandMdcatFile() {

    let editor = vscode.window.activeTextEditor; // エディタ取得
    if (!editor)
    {
        return;
    }

	let doc = editor!.document;            // ドキュメント取得
	
    
	let mdcat = new ExpandMdcat(doc);

    mdcat.exclusionHeaders = vscode.workspace.getConfiguration().get('markdowncat.exclusion.headers') || [];

    mdcat.newpage = vscode.workspace.getConfiguration().get('markdowncat.newpage') || "";
    if (mdcat.newpage.trim() == "")
    {
        mdcat.newpage = "<div style=\"page-break-before:always\"></div>";
    }

    mdcat.run();
    
    vscode.window.showInformationMessage(mdcat.outputFilePath);
}

import * as vscode from "vscode";
import { ExpandMdcat } from "./ExpandMdcat";


export default function expandMdcatFile() {

    // if (ExpandMdcat.mdIt == null)
    // { 
    // }

    let editor = vscode.window.activeTextEditor; // エディタ取得
    if (!editor)
    {
        return;
    }

	let doc = editor!.document;            // ドキュメント取得
	    
	let mdcat = new ExpandMdcat(doc);

    let errMsg = mdcat.loadSettings();
    if (errMsg.length != 0)
    {               
        let caption = 'Failed to read $settings.';
        vscode.window.showErrorMessage(caption, errMsg);
        return;
    }

    try
    {
        mdcat.run();
        vscode.window.showInformationMessage(mdcat.outputFilePath);
    }
    catch (err)
    {
        vscode.window.showErrorMessage(err.message ?? "error");
    }    
}

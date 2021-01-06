import * as vscode from "vscode";
import { getEOL } from "./mdcatUtility";
import { MdcatSettings } from "./MdcatSettings";


export default function ()
{
    // エディタ取得
    let editor = vscode.window.activeTextEditor;
    if (!editor)
    {
        return;
    }

    // ドキュメント取得
    let doc = editor!.document;  
    if (!doc)
    {
        return;			
    }

    let targetLine = editor.selection.start.line;
    //console.log(editor.selection)
    editor.edit((editBuilder) => {
        let pos = new vscode.Position(targetLine, 0);
        editBuilder.insert(pos, "$settings=" + MdcatSettings.snippetSettings(getEOL(doc)));
    });
}
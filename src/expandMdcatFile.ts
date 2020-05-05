import * as vscode from "vscode";
import * as path from "path";
// import { writeFile, appendFile, readFile, appendFileSync, readFileSync, writeFileSync, fstatSync } from 'fs';
import { ExpandMdcat } from "./ExpandMdcat";
// import { DocIterator } from "./DocIterator";
// import { DocBufferTextDocument } from "./DocBuffer";
// import { space_p, line_comment_p, block_comment_p } from "./parser/common_p";
// import { include_p } from "./parser/include_p";

/*
function plane_line_p(it: DocIterator): Boolean
{
	let c = it.next() 
	if (c == "")
	{
		c = it.eol
		it.lineStr = "";
	}
	it.outBuf += c;
	return true
}
*/


function getOutputFilePath(mdcatPath: string)
{
    var s = ""
    s += path.dirname(mdcatPath)
    s += path.sep
    s += path.basename(mdcatPath, path.extname(mdcatPath))
    s += '.md'
    return s
}







export default function expandMdcatFile() {

    let editor = vscode.window.activeTextEditor; // エディタ取得
    if (!editor)
    {
        return;
    }

	let doc = editor!.document;            // ドキュメント取得
	
    
	let mdcat = new ExpandMdcat(doc);

    mdcat.exclusionHeaders = vscode.workspace.getConfiguration().get('markdowncat.exclusion.headers') || [];
   
    mdcat.run();
    
    vscode.window.showInformationMessage(mdcat.outputFilePath);
}

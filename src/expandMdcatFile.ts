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
        return
    }

	let doc = editor!.document;            // ドキュメント取得
	
	let mdcat = new ExpandMdcat(doc);

    vscode.window.showInformationMessage(mdcat.outputFilePath);

	mdcat.run();
	

	/*
    let outFilename = mdcat.outputFilePath
	

	function outputMatchedString(it: DocIterator)
	{
		appendFileSync(outFilename, it.matchedString());
		it.clearMatchedString();
	}
	

	function includeProcess(filepath: string): void
	{
	
		// css の場合
		// md の場合
		// その他
		//outputMatchedString();
		// let data = readFileSync(this.docDir + path.sep + src)
		// let ext = extractExtentision(src);
		// let bCSS = (ext === "css");

		// appendFileSync(this.outFilename, "<!-- " + src + " -->\r\n")

		// if (bCSS) {
		// 	appendFileSync(this.outFilename, "<style>\r\n")
		// }
		
		// appendFileSync(this.outFilename, data)
		
		// if (bCSS) {
		// 	appendFileSync(this.outFilename, "\r\n</style>")
		// }
	}
	





    var it = new DocIterator(new DocBufferTextDocument(doc))
    it.docDir =  path.dirname(outFilename);
	it.outFilename = outFilename
	it.eol = (doc.eol == vscode.EndOfLine.CRLF) ? "\r\n" : "\n";

    while (!it.isEnd())
    {
		it.clearMatchedString();
		it.readLine();

		// スペース
		if (space_p(it))
		{
			outputMatchedString(it);
			continue;
		}

         // コメント
         if (line_comment_p(it) || block_comment_p(it))
         {
             continue;
         }

         // インクルードファイルを展開
         if (include_p(it, includeProcess))
         {
             continue;
         }
        
        // そのままコピー
		plane_line_p(it)
		// 
		//	appendFileSync(outFilename, it.matchedString(true))
    }

    it.flush();
*/
}

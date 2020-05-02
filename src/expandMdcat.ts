import * as vscode from "vscode";
import * as path from "path";
import { writeFile, appendFile, readFile, appendFileSync, readFileSync, writeFileSync, fstatSync } from 'fs';
import { DocIterator } from "./DocIterator";
import { space_p, line_comment_p, block_comment_p } from "./parser/common_p";


function plane_line_p(it: DocIterator): Boolean
{
	let c = it.next() 
	if (c == "")
	{
		c = it.eolToStr()
		it.lineStr = "";
	}
	it.outBuf += c;
	return true
}


function include_p(it: DocIterator): Boolean
{
	if ((it.top() != "$")
	|| (it.char(1) != "i")
	|| (it.char(2) != "n")
	|| (it.char(3) != "c")
	|| (it.char(4) != "l")
	|| (it.char(5) != "u")
	|| (it.char(6) != "d")
	|| (it.char(7) != "e")
	){
		return false;
	}

	var pos = 8;
	var c = it.char(pos++);
	while ((c == " ") || (c == "\t"))
	{
		c = it.char(pos++);	
	}

	if (c != "=")
	{
		// TODO エラー
		return false;
	}
	
	c = it.char(pos++);
	while ((c == " ") || (c == "\t"))
	{
		c = it.char(pos++);	
	}

	if (c != "\"")
	{
		// TODO エラー
		return false;
	}
	
	let begin = pos;
	c = it.char(pos++);
	while (c != "\"")
	{
		c = it.char(pos++);	
	}
	let end = pos;

	//両端の " は除く"
	let filepath = it.lineStr.substr(begin, end - begin - 1)

	c = it.char(pos++);
	while ((c == " ") || (c == "\t"))
	{
		c = it.char(pos++);	
	}
	
	it.charTop = null
	it.column = pos - 1

	it.flush();
	it.include(filepath)

	return true
}

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

    let outFilename = getOutputFilePath(doc.fileName)
    vscode.window.showInformationMessage(outFilename);

	
    writeFileSync(outFilename, "")
    

    var it = new DocIterator(doc)
    it.docDir =  path.dirname(outFilename);
    it.outFilename = outFilename

    while (!it.isEnd())
    {
        it.readLine();

         // コメント
         if (line_comment_p(it) || block_comment_p(it))
         {
             continue;
         }

         // インクルードファイルを展開
         if (include_p(it))
         {
             continue;
         }
        
        // そのままコピー
        plane_line_p(it)
    }

    it.flush();

}

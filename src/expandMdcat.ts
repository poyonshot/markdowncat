import * as vscode from "vscode";
import * as path from "path";
import { writeFile, appendFile, readFile, appendFileSync, readFileSync, writeFileSync, fstatSync } from 'fs';



class DocIterator
{
	doc: vscode.TextDocument;
	row: number;
	column: number;
	lineStr: string;
	outBuf: string;
	charTop: string | null;

	docDir: string;
	outFilename: string;

	constructor(doc: vscode.TextDocument)
	{
		this.doc = doc;
		this.row = 0;
		this.column = 0;
		this.lineStr = "";
		this.outBuf = "";
		this.charTop = null;
		this.docDir = "";
		this.outFilename = "";
	}

	isEnd()
	{
		return (this.lineStr == "") && (this.row >= this.doc.lineCount)
	}

	readLine()
	{
		if (this.lineStr == "")
		{
			this.lineStr = this.doc.lineAt(this.row).text;
			this.row += 1;
			this.column = 0;
			this.charTop = null;
		}
	}

	eolToStr()
	{
		return (this.doc.eol == vscode.EndOfLine.CRLF) ? "\r\n" : "\n";
	}

	top()
	{
		if (!this.charTop)
		{
			this.charTop = this.lineStr.charAt(this.column);
		}
		return this.charTop;
	}

	next()
	{
		this.charTop = this.lineStr.charAt(this.column++);
		return this.charTop;
	}

	char(offset: number)
	{
		return this.lineStr.charAt(this.column + offset);
	}


	flush()
	{
		if (this.outBuf != "")
		{
			appendFileSync(this.outFilename, this.outBuf)
			this.outBuf = "";	
		}
	}

	include(src: string)
	{
		let data = readFileSync(this.docDir + "\\" + src)

		appendFileSync(this.outFilename, "<!-- " + src + " -->\r\n")
		
		appendFileSync(this.outFilename, data)
	}
}


function line_comment_p(it: DocIterator): Boolean
{
	if ((it.top() != "/") || (it.char(1) != "/"))
	{
		return false;
	}

	it.lineStr = "";

	return true
}


function block_comment_p(it: DocIterator): Boolean
{
	if ((it.top() != "/") || (it.char(1) != "*"))
	{
		return false;
	}

	var pos = 2;
	var c = it.char(pos++);
	do
	{
		if (!c)
		{
			it.lineStr = ""
			it.readLine();
			if (it.isEnd())
			{
				//TODO:エラー
				return true;
			}

			pos = 0;
		}

		c = it.char(pos++);
		if (c != "*") {
			continue
		}

		c = it.char(pos++);
		if (c == "/") {
			it.column = pos
			return true
		}

	} while(true);
}


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
    s += '\\'
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
             // while(space_p(pos)) {}
             // eol_p(pos)
             continue;
         }
        
        // そのままコピー
        plane_line_p(it)
    }

    it.flush();

}

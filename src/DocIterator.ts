import * as vscode from "vscode";
import * as path from "path";
import { writeFile, appendFile, readFile, appendFileSync, readFileSync, writeFileSync, fstatSync } from 'fs';
import { extractExtentision } from "./mdcatUtility";
import { DocBuffer } from "./DocBuffer";


export class DocIterator
{
	buffer: DocBuffer;
	row: number;
	column: number;
	eol: string;
	lineStr: string;
	outBuf: string;
	charTop: string | null;

	docDir: string;
	outFilename: string;

	constructor(buffer: DocBuffer)
	{
		this.buffer = buffer;
		this.eol = "\r\n";
		this.row = 0;
		this.column = 0;
		this.lineStr = "";
		this.outBuf = "";
		this.charTop = null;
		this.docDir = "";
		this.outFilename = "";
	}

	clone()
	{
		let it = new DocIterator(this.buffer);
		it.row = this.row;
		it.column = this.column;
		it.lineStr = this.lineStr;
		it.outBuf = this.outBuf;
		it.charTop = this.charTop;
		it.docDir = this.docDir;
		it.outFilename = this.outFilename;
		return it;
	}

	isEnd()
	{
		return (this.lineStr == "") && this.buffer.isEmpty
	}

	readLine()
	{
		if (this.lineStr == "")
		{
			this.lineStr = this.buffer.readLine();
			this.row += 1;
			this.column = 0;
			this.charTop = null;
		}
	}

	top()
	{
		if (!this.charTop)
		{
			this.charTop = this.lineStr.charAt(this.column);
		}
		return this.charTop;
	}

	next(n: number | null = null)
	{
		if (n == null) {
			n = 1
		}
		if (n >= 1) {
			this.column += n
			this.charTop = this.lineStr.charAt(this.column - 1);
		}
		return this.charTop;
	}

	char(offset: number)
	{
		return this.lineStr.charAt(this.column + offset);
	}

	str(offset: number, len: number)
	{
		let begin = this.column + offset;
		return this.lineStr.slice(begin, begin + len);
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
		let data = readFileSync(this.docDir + path.sep + src)
		let ext = extractExtentision(src);
		let bCSS = (ext === "css");

		appendFileSync(this.outFilename, "<!-- " + src + " -->\r\n")

		if (bCSS) {
			appendFileSync(this.outFilename, "<style>\r\n")
		}
		
		appendFileSync(this.outFilename, data)
		
		if (bCSS) {
			appendFileSync(this.outFilename, "\r\n</style>")
		}
	}


	clearMatchedString(): void
	{
	}

	matchedString(): string
	{
		return "";
	}
}





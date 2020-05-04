import * as vscode from "vscode";
import * as path from "path";
import { writeFile, appendFile, readFile, appendFileSync, readFileSync, writeFileSync, fstatSync } from 'fs';
import { extractExtentision } from "./mdcatUtility";
import { DocBuffer } from "./DocBuffer";


export class DocIterator
{
	buffer: DocBuffer;
	pos: number;
	eol: string;
	lineStr: string;
	charTop: string | null;

	docDir: string;
	outFilename: string;

	constructor(buffer: DocBuffer)
	{
		this.buffer = buffer;
		this.eol = "\r\n";
		this.pos = 0;
		this.lineStr = "";
		this.charTop = null;
		this.docDir = "";
		this.outFilename = "";
	}

	clone()
	{
		let it = new DocIterator(this.buffer);
		it.pos = this.pos;
		it.lineStr = this.lineStr;
		it.charTop = this.charTop;
		it.docDir = this.docDir;
		it.outFilename = this.outFilename;
		return it;
	}

	get isEOL(): boolean
	{
		return this.pos >= this.lineStr.length;
	}

	isEnd()
	{
		return this.isEOL && this.buffer.isEmpty;
	}

	readLine()
	{
		if (this.lineStr != "")
		{
			this.lineStr += "\n";
		}

		this.lineStr += this.buffer.readLine();
		this.charTop = this.lineStr.charAt(this.pos);
	}

	top()
	{
		if (!this.charTop)
		{
			this.charTop = this.lineStr.charAt(this.pos);
		}
		return this.charTop;
	}

	next(n: number | null = null)
	{
		if (n == null) {
			n = 1
		}
		if (n >= 1) {
			this.pos += n
			this.charTop = this.lineStr.charAt(this.pos);
		}
		return this.charTop;
	}

	char(offset: number)
	{
		return this.lineStr.charAt(this.pos + offset);
	}

	str(offset: number, len: number)
	{
		let begin = this.pos + offset;
		return this.lineStr.slice(begin, begin + len);
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


	getMatched(): string
	{
		return (this.pos >  0) ? this.lineStr.substr(0, this.pos) : "";
	}

	discardMatched(): void
	{
		if (this.pos > 0)
		{
			this.lineStr = this.lineStr.substr(this.pos);
			this.pos = 0;
		}
	}
}





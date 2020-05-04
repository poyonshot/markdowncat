import * as vscode from "vscode";
import * as path from "path";
import { writeFile, appendFile, readFile, appendFileSync, readFileSync, writeFileSync, fstatSync } from 'fs';
import { extractExtentision } from "./mdcatUtility";
import { DocBuffer } from "./DocBuffer";


export class DocIterator
{
	buffer: DocBuffer;
	pos: number;
	charTop: string | null;
	get lineStr(): string { return this.buffer.lineStr; }

	constructor(buffer: DocBuffer)
	{
		this.buffer = buffer;
		this.pos = 0;
		this.charTop = null;
	}

	clone()
	{
		let it = new DocIterator(this.buffer);
		it.pos = this.pos;
		it.charTop = this.charTop;
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
		this.buffer.readLine();
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

	advance(n: number = 1)
	{
		this.pos += n
		this.charTop = this.lineStr.charAt(this.pos);
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

	getMatched(): string
	{
		return (this.pos >  0) ? this.lineStr.substr(0, this.pos) : "";
	}

	discardMatched(): void
	{
		this.buffer.discard(this.pos);
		this.pos = 0;
	}
}





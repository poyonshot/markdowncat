import * as vscode from "vscode";


export interface DocBuffer 
{
	readonly isEmpty: Boolean;
	readonly lineStr: string;
	
	readLine(): string;

	discard(n: number): void
}


export class DocBufferBinary implements DocBuffer
{
    data: Buffer;
    pos: number;
	lineStr: string;

	constructor(data: Buffer | null = null)
	{
        this.data = data || Buffer.alloc(0);
        this.pos = 0;
		this.lineStr = "";
    }
    
	get isEmpty(): Boolean
	{
		return (this.data.length == this.pos)
	}

    readLine(): string
    {
        let begin = this.pos;
        var end = this.data.indexOf("\n", this.pos);
        if (end < 0)
        {
            end = this.data.length;
        } 
        else
        {
            end = end + 1;
		}
		this.pos = end;

		var str = this.data.toString("utf-8", begin, end);
		this.lineStr += str;
		return str;
	}
	
	discard(n: number): void
	{
		if (n > 0)
		{
			this.lineStr = this.lineStr.substr(n);
		}
	}
}


export class DocBufferTextDocument implements DocBuffer
{
	doc: vscode.TextDocument;
	row: number;
	column: number;
	lineStr: string;

	constructor(doc: vscode.TextDocument)
	{
        this.doc = doc;
		this.row = 0;
		this.column = 0;
		this.lineStr = "";
    }
    
	get isEmpty(): Boolean
	{
		return (this.row >= this.doc.lineCount);
	}

    readLine(): string
    {
		if (this.isEmpty)
		{
			return "";
		}

		let str = this.doc.lineAt(this.row).text;
		this.row += 1;
		this.column = 0;
		if (!this.isEmpty)
		{
			str += "\n";
		}
		this.lineStr += str;
		return str;
	}

	discard(n: number): void
	{
		if (n > 0)
		{
			this.lineStr = this.lineStr.substr(n);
		}
	}
}

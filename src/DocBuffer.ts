import * as vscode from "vscode";
import * as path from "path";

import { DocIterator } from "./DocIterator";
import { writeFile, appendFile, readFile, appendFileSync, readFileSync, writeFileSync, fstatSync } from 'fs';
import { extractExtentision } from "./mdcatUtility";
import { strict } from "assert";


export interface DocBuffer 
{
	readonly isEmpty: Boolean;
	
	readLine(): string;
}


export class DocBufferBinary implements DocBuffer
{
    data: Buffer;
    pos: number;

	constructor(data: Buffer | null = null)
	{
        this.data = data || new Buffer("");
        this.pos = 0;
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
            this.pos = end;
        } 
        else
        {
            this.pos = end + 1;
        }
        return this.data.toString("utf-8", begin, end).trimRight();
    }
}


export class DocBufferTextDocument implements DocBuffer
{
	doc: vscode.TextDocument;
	row: number;
	column: number;

	constructor(doc: vscode.TextDocument)
	{
        this.doc = doc;
		this.row = 0;
		this.column = 0;
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
		else
		{
			let str = this.doc.lineAt(this.row).text;
			this.row += 1;
			this.column = 0;
			return str.trimRight();
		}
    }
}

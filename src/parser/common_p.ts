import * as vscode from "vscode";
import { DocIterator } from "../DocIterator";

export function space_p(it: DocIterator): Boolean
{
	var pos = 0;
	var c = it.top();
	while ((c == " ") || (c == "\t"))
	{
		++pos;
	 	c = it.char(pos);	
	}

	if (pos == 0)
	{
		return false;
	}

	it.advance(pos);
	return true;
}


export function eol_p(it: DocIterator): Boolean
{
	var pos = 0;
	var c = it.top();
	if (c == "\r")
	{
		++pos;
		c = it.char(pos);	
	}

	if (c != "\n")
	{
		return false;
	}

	++pos;
	it.advance(pos);
	return true;
}

export function str_p(it: DocIterator, str: string): Boolean
{
	if (it.str(0, str.length) != str)
	{
		return false;
	}
	it.advance(str.length);
	return true;
}


export function line_comment_p(it: DocIterator): Boolean
{
	if ((it.top() != "/") || (it.char(1) != "/"))
	{
		return false;
	}

	let pos = it.lineStr.indexOf("\n", it.pos + 2);
	it.pos = (pos >= 0) ? pos : it.lineStr.length;

	return true;
}


export function block_comment_p(it: DocIterator): Boolean
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
			it.readLine();
			if (it.isEnd())
			{
				//TODO:エラー
				return false;
			}
			//改行文字分
			pos += 1;
		}

		c = it.char(pos++);
		if (c != "*") {
			continue
		}

		c = it.char(pos++);
		if (c == "/") {
			it.pos = pos
			return true
		}

	} while(true);
}


export function line_any_p(it: DocIterator): Boolean
{
	let pos = it.lineStr.indexOf("\n", it.pos);
	it.pos = (pos >= 0) ? (pos + 1) : it.lineStr.length;
	return true
}



export function object_p(it: DocIterator): Boolean
{
	if (it.top() != "{")
	{
		return false;
	}
	it.advance();

    var p = it.clone();

	var pos = 0;
	var c = it.top();
	do
	{
		if (!c)
		{
			it.readLine();
			if (it.isEnd())
			{
				//TODO:エラー
				return true;
			}

			pos = 0;
		}

		c = it.char(pos++);
		if (c != "}") {
			continue
		}

		c = it.char(pos++);
		if (c == "}") {
			it.pos = pos
			return true
		}

	} while(true);
}

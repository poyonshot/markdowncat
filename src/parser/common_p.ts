import * as vscode from "vscode";
import { DocIterator } from "../DocIterator";
import { strict } from "assert";

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



///	正規表現
export function reg_p(it: DocIterator, pattern: RegExp): Boolean
{
	if (it.needRead)
	{
		it.readLine();
	}

	if (it.top() != "\"")
	{
		return false;
	}

	var bMacth = false;
	var cur = 1;
	var c = it.char(cur++);
	while (c)
	{
		if (c == "\\")
		{
			c = it.char(cur++);
			c = it.char(cur++);
		}

		if (c == "\"")
		{
			bMacth = true;
			break;
		}
	}

	c == "\""

	"\"" && reg_p(it, /[^"]*/) && "\"";


	let m = it.lineStr.match(pattern)
	if (!m)
	{
		return false;
	}

	var str = "";
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

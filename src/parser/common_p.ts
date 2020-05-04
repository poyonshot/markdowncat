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

	it.next(pos);
	return true;
}


export function line_comment_p(it: DocIterator): Boolean
{
	if ((it.top() != "/") || (it.char(1) != "/"))
	{
		return false;
	}

	let pos = it.lineStr.indexOf("\n", it.column + 2);
	it.column = (pos >= 0) ? pos : it.lineStr.length;

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
			it.lineStr = ""
			it.readLine();
			if (it.isEnd())
			{
				//TODO:エラー
				return false;
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


export function line_any_p(it: DocIterator): Boolean
{
	let pos = it.lineStr.indexOf("\n", it.column);
	it.column = (pos >= 0) ? pos : it.lineStr.length;
	return true
}



export function object_p(it: DocIterator): Boolean
{
	if (it.top() != "{")
	{
		return false;
	}
	it.next();

    var p = it.clone();

	var pos = 0;
	var c = it.top();
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
		if (c != "}") {
			continue
		}

		c = it.char(pos++);
		if (c == "}") {
			it.column = pos
			return true
		}

	} while(true);
}

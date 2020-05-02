import * as vscode from "vscode";
import { DocIterator } from "../DocIterator";

export function space_p(it: DocIterator): Boolean
{
	var pos = 0;
	var c = it.char(pos++);
	while ((c == " ") || (c == "\t"))
	{
	 	c = it.char(pos++);	
	}
	it.next(pos)
	return true
}


export function line_comment_p(it: DocIterator): Boolean
{
	if ((it.top() != "/") || (it.char(1) != "/"))
	{
		return false;
	}

	it.lineStr = "";

	return true
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

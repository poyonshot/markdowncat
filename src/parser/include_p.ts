import * as vscode from "vscode";
import { DocIterator } from "../DocIterator";
import { space_p } from "./common_p";


export function include_p(it: DocIterator, onMatch: (filepath: string) => void): Boolean
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

    onMatch(filepath);
	it.flush();
	it.include(filepath)

	return true
}
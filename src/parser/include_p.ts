import * as vscode from "vscode";
import { DocIterator } from "../DocIterator";
import { space_p, str_p } from "./common_p";


export function include_p(it: DocIterator, onMatch: (filepath: string) => void): Boolean
{
	var p = it.clone();

	if (!str_p(p, "$include"))
	{
		return false;
	}

	space_p(p);

	if (!str_p(p, "="))
	{
		// TODO エラー
		return false;
	}
	
	space_p(p);

	if (!str_p(p, "\""))
	{
		// TODO エラー
		return false;
	}
	
	var cur = 0
	var c = p.char(cur++);
	while (c != "\"")
	{
		if ((c == "\n") || (c == ""))
		{
			// " の前に改行や終端に達した
			return false;
		}
		c = p.char(cur++);	
	}

	//両端の " は除く"
	let filepath = p.lineStr.substr(p.pos, cur - 1)
	p.advance(cur);

	space_p(p);
	
    onMatch(filepath);

	it.pos = p.pos;
	it.charTop = null;

	return true
}
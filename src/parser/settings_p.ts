import * as vscode from "vscode";
import { DocIterator } from "../DocIterator";
import { space_p, str_p } from "./common_p";

export function settings_p(it: DocIterator, onMatch: (json: string) => void): Boolean
{
	var p = it.clone();

	if (!str_p(p, "$settings"))
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

	if (p.top() != "{")
	{
	 	// TODO エラー
		return false;
	}
	
	let begin = p.pos;
	var index = 1;
	var cur = 1;
	while (index > 0)
	{
		var c = p.char(cur++);
		switch (c)
		{
		case "{": index += 1; break;
		case "}": index -= 1; break;
		case "\n":
		case "":
		case null: 
		 	// TODO エラー
			return false;
		}
	}
	
	let str = p.lineStr.substr(p.pos, cur)
	p.advance(cur);

	space_p(p);
    //onMatch(str);

	return true
}

import * as vscode from "vscode";
import { DocIterator } from "../DocIterator";
import { space_p } from "./common_p";

export function settings_p(it: DocIterator): Boolean
{
    let len = 9
    if ((it.top() != "$") || (it.str(0, len) != "$settings"))
    {
		return false;
    }
    it.advance(len)

    var p = it.clone();

    space_p(p);

	if (p.top() != "=")
	{
		return false;
	}
    it.advance()
	
    space_p(p);

	// if (c != "\"")
	// {
	// 	// TODO エラー
	// 	return false;
	// }
	
	// let begin = pos;
	// c = it.char(pos++);
	// while (c != "\"")
	// {
	// 	c = it.char(pos++);	
	// }
	// let end = pos;

	// //両端の " は除く"
	// let filepath = it.lineStr.substr(begin, end - begin - 1)

	// c = it.char(pos++);
	// while ((c == " ") || (c == "\t"))
	// {
	// 	c = it.char(pos++);	
	// }
	
	// it.charTop = null
	// it.column = pos - 1

	// it.flush();
	// it.include(filepath)

	return true
}

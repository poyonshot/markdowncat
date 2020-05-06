import * as vscode from "vscode";
import { DocIterator } from "../DocIterator";
import { space_p, str_p } from "./common_p";
import * as js from "./javascript_p";

export function settings_p(it: DocIterator, onMatch: (str: string) => void): Boolean
{
	if (!str_p(it, "$settings"))
	{
		return false;
	}

	var p = it.clone();

	space_p(p);

	if (!str_p(p, "="))
	{
		// TODO エラー
		return false;
	}

	space_p(p);
	
	let begin = p.pos;
	if (!js.object_p(p))
	{
		return false;
	}

	onMatch(p.getMatched(begin));
	it.advance(p.pos - it.pos);

	return true
}

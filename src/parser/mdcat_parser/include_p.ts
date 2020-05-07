import { DocIterator } from "../../DocIterator";
import { space_p, str_p } from "../common_p";
import * as js from "../javascript_p";


export function include_p(it: DocIterator, onMatch: (filepath: string) => void): Boolean
{
    if (it.top() != "$")
    {
        return false;
    }

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

	let begin = p.pos;
	if (!js.string_p(p))
	{
		return false;
	}

	//両端の " は除く"
	let len = p.pos - begin - 2; 
	let filepath = p.lineStr.substr(begin + 1, len)
	
	space_p(p);
	it.advance(p.pos - it.pos);

	onMatch(filepath);
	
	return true
}
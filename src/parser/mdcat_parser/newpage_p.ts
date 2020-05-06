import { DocIterator } from "../../DocIterator";
import { space_p, str_p, eol_p } from "../common_p";


export function newpage_p(it: DocIterator, onMatch: () => void): Boolean
{
    if (it.top() != "$")
    {
        return false;
    }

	var p = it.clone();
	
	if (!str_p(p, "$newpage"))
	{
		return false;
	}

    if (!(space_p(p) || eol_p))
    {
		return false;
    }

	it.advance(p.pos - it.pos);

	onMatch();
	return true
}

import { DocIterator } from "../DocIterator";
import { space_p, str_p } from "./common_p";

export function header_p(it: DocIterator, onMatch: (level: number, header: string) => void): Boolean
{
    if (it.top() != "#")
    {
        return false;
    }

    var p = it.clone();
    
	var cur = 0;
	var c = p.top();
    while (c == "#")
	{
		++cur;
	 	c = p.char(cur);	
    }
    p.advance(cur)
    let level = cur;

    space_p(p);
    
    //改行まで
	var c = p.top();
    while (c && (c != "\n"))
	{
		++cur;
	 	c = p.char(cur);	
	}
	let header = p.lineStr.substr(p.pos, cur - 1).trim();
	p.advance(cur);

    it.advance(p.pos - it.pos);
    onMatch(level, header);


    return true;
}

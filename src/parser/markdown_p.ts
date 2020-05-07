import { DocIterator } from "../DocIterator";
import { space_p, str_p } from "./common_p";

export function header_p(it: DocIterator, onMatch: (level: number, header: string) => void): Boolean
{
    if (it.top() != "#")
    {
        return false;
    }

    var p = it.clone();
    
	var count = 0;
	var c = p.top();
    while (c == "#")
	{
		++count;
	 	c = p.char(count);	
    }
    p.advance(count)
    let level = count;

    space_p(p);
    
    //改行まで
    var c = p.top();
    count = 0;
    while (c && (c != "\n"))
	{
		++count;
	 	c = p.char(count);	
	}
	let header = p.lineStr.substr(p.pos, count).trim();
	p.advance(count);

    it.advance(p.pos - it.pos);
    onMatch(level, header);


    return true;
}

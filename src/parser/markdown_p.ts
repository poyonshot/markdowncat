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


export function code_block_p(it: DocIterator, name: string | null = null): Boolean
{
    if ((it.top() != "`") || (it.str(0, 3) != "```"))
	{
		return false;
	}

    var p = it.clone();
    p.advance(3);

    //改行まで
    var c = p.top();
    var count = 0;
    while (c && (c != "\n"))
	{
		++count;
	 	c = p.char(count);	
    }
    
	var str = p.lineStr.substr(p.pos, count).trim();
    p.advance(count + 1);

    if ((name != null) && (name != str))
    {
        return false;
    }
    
    var bMacth = false;
	do
	{
        //改行まで
        c = p.top();
        count = 0;
        while (c && (c != "\n"))
        {
            ++count;
            c = p.char(count);	
        }
        
        str = p.lineStr.substr(p.pos, count).trim();
        p.advance(count + 1);

        bMacth = (str == "```");
        if (bMacth)
        {
            it.advance(p.pos - it.pos);
            break;
        }
    } while(c);
    
	return bMacth;
}


export function comment_p(it: DocIterator): Boolean
{
    if ((it.top() != "<") || (it.str(0, 4) != "<!--"))
	{
		return false;
	}

    var p = it.clone();
    p.advance(4);

    //コメント終端まで
    var c = p.top();
    
    var bMacth = false;
	do
	{
        c = p.top();
        if ((c != "-") || (p.str(0, 3) != "-->"))
        {
            p.advance(1);
            continue;
        }
    
        p.advance(3);
        break;

    } while(c);
    
    it.advance(p.pos - it.pos);
	return true;
}

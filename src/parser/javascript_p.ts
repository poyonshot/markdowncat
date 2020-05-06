import { DocIterator } from "../DocIterator";
import { space_p, str_p } from "./common_p";



export function string_p(it: DocIterator): Boolean
{
    let bracke = it.top();
	if ((bracke != "\"") && (bracke != "'"))
	{
		return false;
	}

	var bMacth = false;
	var count = 1;
    var c ="";
    do
	{
        c = it.char(count++);

		if (c == "\\")
		{
            c = it.char(count++);
		}

		if (c == bracke)
		{
			bMacth = true;
			break;
		}
	} while (c && (c != "\n"));

    if (bMacth)
    {
        it.advance(count);
    }

    return bMacth;
}


export function object_p(it: DocIterator): Boolean
{
	if ((it.top() != "{"))
	{
		return false;
    }
    
    var p = it.clone();
    p.advance(1);

	var bMacth = false;
    var c ="";
    do
	{
        if (string_p(p))
        {
            continue;
        }

        if (object_p(p))
        {
            // TODO  { } の中に文法エラーがあったときの対応
            continue;
        }

		c = p.top();
        p.advance(1);

        if (c == "}")
        {
            bMacth = true;
            it.advance(p.pos - it.pos)
			break;
        }

    } while (c);

    return bMacth;
}

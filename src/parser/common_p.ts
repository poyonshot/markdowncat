import { DocIterator } from "../DocIterator";


export function space_p(it: DocIterator): Boolean
{
	var c = it.top();
	var pos = 0;
	while ((c == " ") || (c == "\t"))
	{
		++pos;
	 	c = it.char(pos);	
	}

	if (pos == 0)
	{
		return false;
	}

	it.advance(pos);
	return true;
}


export function eol_p(it: DocIterator): Boolean
{
	var pos = 0;
	var c = it.top();
	if (c == "\r")
	{
		++pos;
		c = it.char(pos);	
	}

	if (c != "\n")
	{
		return false;
	}

	++pos;
	it.advance(pos);
	return true;
}

export function str_p(it: DocIterator, str: string): Boolean
{
	if (it.str(0, str.length) != str)
	{
		return false;
	}
	it.advance(str.length);
	return true;
}


export function line_comment_p(it: DocIterator): Boolean
{
	if ((it.top() != "/") || (it.char(1) != "/"))
	{
		return false;
	}

	let pos = it.lineStr.indexOf("\n", it.pos + 2);
	it.pos = (pos >= 0) ? pos : it.lineStr.length;

	return true;
}


export function block_comment_p(it: DocIterator): Boolean
{
	if ((it.top() != "/") || (it.char(1) != "*"))
	{
		return false;
	}

	var bMacth = false;
	var count = 2;
	var c = "";
	do
	{
		c = it.char(count++);

		if (c != "*")
		{
			continue
		}

		c = it.char(count++);
		if (c == "/") {
			bMacth = true;
			it.advance(count);
			break;
		}

	} while(c);

	return bMacth;
}


export function line_any_p(it: DocIterator): Boolean
{
	let pos = it.lineStr.indexOf("\n", it.pos);
	it.pos = (pos >= 0) ? (pos + 1) : it.lineStr.length;
	return true
}


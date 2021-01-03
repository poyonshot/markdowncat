import MarkdownIt from 'markdown-it';
import Token from 'markdown-it/lib/token';
import Renderer from 'markdown-it/lib/renderer';


class TokenIterator
{
	tokens: Token[];
	pos: number;

	constructor(tokens: Token[])
	{
		this.tokens = tokens;
		this.pos = 0;
	}

	clone()
	{
		let it = new TokenIterator(this.tokens);
	 	it.pos = this.pos;
	 	return it;
	}

	get(): Token
	{
		return this.tokens[this.pos];
	}

	isEnd()
	{
		return this.pos >= this.tokens.length;
	}

	advance(n: number = 1)
	{
		this.pos += n;
		if (this.isEnd())
		{
			this.pos = this.tokens.length;				
		}
	}
}


class TableItem {
	label = '';
	startPos = 0;
	endPos = 0;
}





function table_p(it: TokenIterator, mapTableItem: { [label: string]: TableItem }, options : MarkdownIt.Options, md: MarkdownIt): boolean
{
	if (it.isEnd() || (it.get().type != 'table_open'))
	{
		return false;
	}

	var column = 0;
	var row = 0;

	for (; !it.isEnd(); it.advance())
	{
		let token = it.get();

		if (token.type == 'tr_close')
		{
			column += 1;
			row = 0;
			continue;
		}

		if ((token.type == 'td_close') || (token.type == 'th_close'))
		{
			let label = `${column}-${row}`;

			let lastToken = it.tokens[it.pos - 1];
			lastToken.content = label;
			let m = mapTableItem[label]
			if (m != null)
			{
				lastToken.children = it.tokens.slice(m.startPos, m.endPos);

				var s = md.renderer.render(lastToken.children, options, {});
				lastToken.content = s;
				lastToken.type = 'html_block';
			}

			row += 1;
			continue;
		}

		if (token.type == 'table_close')
		{
			it.advance();
			return true;
		}
	}

	return true;
}

function tableItem_p(it: TokenIterator, item: TableItem): boolean
{
	if (it.isEnd() || (it.get().type != 'heading_open'))
	{
		return false;
	}

	for (it.advance(); !it.isEnd(); it.advance())
	{
		var token = it.get();

		if (token.type == 'inline')
		{
			item.label = token.content;
			continue;
		}
		
		if (token.type == 'heading_close')
		{
			it.advance();
			break;
		}
	}

	//開始位置
	item.startPos = it.pos;

	for (; !it.isEnd(); it.advance())
	{
		var token = it.get();

		if (token.type != 'heading_open')
		{
			continue;
		}
		
		break;
	}

	//終了位置
	item.endPos = it.pos;

	return true;
}



function parseContent(src: string, options : MarkdownIt.Options, env: any, md: MarkdownIt): Token[]
{
	var tokens = md.parse(src, {});

	var it = new TokenIterator(tokens);

	const mapTableItem: { [label: string]: TableItem } = {};

	while (!it.isEnd())
	{
		var item = new TableItem();
		if (!tableItem_p(it, item)) 
		{
			it.advance();
			continue;
		}
		 
		mapTableItem[item.label] = item;
	}

	var start = 0;
	it = new TokenIterator(tokens);
	while (!it.isEnd())
	{
		start = it.pos;
		if (!table_p(it, mapTableItem, options, md)) 
		{
			it.advance();
			continue;
		}
		 
		break;
	}

	return tokens.slice(start, it.pos);
}



export function mdcatTable(md : MarkdownIt, options : MarkdownIt.Options): MarkdownIt {

	// var defaults = {
	//   defs: {},
	//   shortcuts: {},
	//   enabled: []
	// };
  
	const defaultRender = md.renderer.rules.fence;

	md.renderer.rules.fence = (tokens, idx, options, env, self) => {
		let token = tokens[idx];
		let info = token.info ? String(token.info).trim() : "";
		
		if (info == "mdcat.table")
		{
			let tableTokens = parseContent(token.content, options, env, md);		
			let s = md.renderer.render(tableTokens, options, env);
			return s;
		}

		return defaultRender?.(tokens, idx, options, env, self).toString() ?? "";
	};

	return md;
}
  





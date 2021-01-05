import MarkdownIt from 'markdown-it';
import Token from 'markdown-it/lib/token';
import { mergeTableCell } from './mdCatTableMergeCell';

export class TokenIterator
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


class MdcatTablePlugin
{
	md : MarkdownIt;
	options : MarkdownIt.Options;
	env : any;

	tableStartPos = 0;
	tableEndPos = 0;
	tableItemMap: { [label: string]: TableItem } = {};

	constructor(md : MarkdownIt, options : MarkdownIt.Options, env : any)
	{
		this.md = md;
		this.options = options;
		this.env = env;
    }
    
	render(src: string): string
	{	
		var tokens = this.md.parse(src, this.env);

		if (this.initPrms(tokens))
		{
			var it = new TokenIterator(tokens);
			it.pos = this.tableStartPos;
	
			let mergedTokens = mergeTableCell(it);
			if (mergedTokens != null)
			{
				it.tokens.splice(this.tableStartPos, this.tableEndPos - this.tableStartPos);
				for (var i = 0; i < mergedTokens.length; ++i)
				{
					it.tokens.splice(this.tableStartPos + i, 0, mergedTokens[i]);
				}
				this.tableEndPos = this.tableStartPos + mergedTokens.length;	
			}

			it.pos = this.tableStartPos;
			var tableTokens = this.buildTableToken(it);
			if (tableTokens != null)
			{
				tokens = tableTokens;
			}
		}

		let s = this.md.renderer.render(tokens, this.options, this.env);
		console.log(s);
		return s;
	}
	
	findToken(tokens: Token[], begin: number, type: string): number
	{
		for (var pos = begin; pos < tokens.length; ++pos)
		{
			if (tokens[pos].type === type)
			{
				return pos;
			}
		}

		return -1;
	}

	initPrms(tokens: Token[]): boolean
	{
		this.tableStartPos = 0;
		this.tableEndPos = 0;
		this.tableItemMap = {};


		this.tableStartPos = this.findToken(tokens, 0, 'table_open');
		if (this.tableStartPos < 0)
		{
			return false;
		}
		
		this.tableEndPos = this.findToken(tokens, this.tableStartPos + 1, 'table_close');
		if (this.tableEndPos < 0)
		{
			return false;
		}
		this.tableEndPos += 1;


		var it = new TokenIterator(tokens);
		it.pos = this.tableEndPos;

		while (!it.isEnd())
		{
			var item = this.tableItem_p(it);
			if (item == null) 
			{
				it.advance();
				continue;
			}		 
			this.tableItemMap[item.label] = item;
		}

		return true;
	}
		
	tableItem_p(it: TokenIterator): TableItem | null
	{
		if (it.isEnd() || (it.get().type !== 'heading_open'))
		{
			return null;
		}

		let item = new TableItem();

		for (it.advance(); !it.isEnd(); it.advance())
		{
			var token = it.get();

			if (token.type === 'inline')
			{
				item.label = token.content;
				continue;
			}
			
			if (token.type === 'heading_close')
			{
				it.advance();
				break;
			}
		}

		//開始位置
		item.startPos = it.pos;

		for (; !it.isEnd(); it.advance())
		{
			if (it.get().type !== 'heading_open')
			{
				continue;
			}
			
			break;
		}

		//終了位置
		item.endPos = it.pos;

		return item;
	}

	
	buildTableToken(it: TokenIterator): Token[] | null
	{	
		if (it.isEnd() || (it.get().type !== 'table_open'))
		{
			return null;
		}
		
		var column = 0;
		var row = 0;

		for (; !it.isEnd(); it.advance())
		{
			let token = it.get();

			if (token.type === 'tr_close')
			{
				column += 1;
				row = 0;
				continue;
			}

			if ((token.type === 'td_close') || (token.type === 'th_close'))
			{
				let label = `${column}-${row}`;

				let lastToken = it.tokens[it.pos - 1];
				lastToken.content = label;

				let m = this.tableItemMap[label];
				if (m != null)
				{
					let children = it.tokens.slice(m.startPos, m.endPos);
					if ((children.length == 3) && (children[0].type == "paragraph_open"))
					{
						// <p>xxx</p> だけの場合
						lastToken.children = []
						lastToken.content = children[1].content;
						lastToken.type = 'html_block';	
					}
					else
					{
						lastToken.children = children;
						lastToken.content = this.md.renderer.render(lastToken.children, this.options, this.env);
						lastToken.type = 'html_block';	
					}
				}

				row += 1;
				continue;
			}

			if (token.type === 'table_close')
			{
				it.advance();
				break;
			}
		}

		return it.tokens.slice(0, it.pos);
	}
}


export function mdcatTable(md : MarkdownIt, options : MarkdownIt.Options): MarkdownIt {
  
	const defaultRender = md.renderer.rules.fence;

	md.renderer.rules.fence = (tokens, idx, options, env, self) => {
	
		let token = tokens[idx];
		let info = token.info ? String(token.info).trim() : "";
		
		if (info === "mdcat.table")
		{
			const m = new MdcatTablePlugin(md, options, env);
			return m.render(token.content);
		}

		return defaultRender?.(tokens, idx, options, env, self).toString() ?? "";
	};

	return md;
}
  





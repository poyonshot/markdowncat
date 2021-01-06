import MarkdownIt from 'markdown-it';
import Token from 'markdown-it/lib/token';


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


class TableItem
{
	label = '';
	startPos = 0;
	endPos = 0;
	tokens: Token[] = [];
	content = "";
}


enum MergeSymbol
{
    None = 0,
    Left = 1,
    Right = 2,
    Up = 3,
}


class TableCell
{
    row: number;
    column: number;
    isRowEnd = false;

    curRow: number;
    curColumn: number;
    colspan: number;
    rowspan: number;
	symbol = MergeSymbol.None;
	custumLabel = "";
	
    tokenOpen: Token | null = null;
    tokenBegin = 0;
    tokenEnd = 0;

    constructor(row: number, column: number)
	{
		this.row = row;
        this.column = column;
		this.curRow = row;
        this.curColumn = column;
        this.colspan = 1;
        this.rowspan = 1;
	}

    label(): string
    {
        return `${this.curColumn}-${this.curRow}`;
    }
}


class MdcatTable
{
    tokens: Token[] = [];
    cells: TableCell[] = [];
	hasMergeSymbol = false;
	cellMap = new Map<string, TableCell>();


    initCells(tokens: Token[]): boolean
    {
        this.tokens = tokens;
        this.cells = [];

        var it = new TokenIterator(tokens);
        if (it.isEnd() || (it.get().type !== 'table_open'))
        {
            return false;
        }

        var column = 0;
        var row = 0;

        const symbolMap = new Map<string, MergeSymbol>();
        symbolMap.set("<", MergeSymbol.Left);
        symbolMap.set(">", MergeSymbol.Right);
        symbolMap.set("^", MergeSymbol.Up);

        for (; !it.isEnd(); it.advance())
        {
            let token = it.get();

            if (token.type === 'td_open')
            {
                continue;
            }

            if (token.type === 'tr_close')
            {
                if (this.cells.length > 0)
                {
                    this.cells[this.cells.length - 1].isRowEnd = true;
                }
                column += 1;
                row = 0;
                continue;
            }

            if ((token.type === 'td_close') || (token.type === 'th_close'))
            {
                var cell = new TableCell(row, column);
                cell.row = row;
                cell.column = column;
                cell.tokenOpen = it.tokens[it.pos - 2];
                cell.tokenBegin = it.pos - 2;
                cell.tokenEnd = it.pos + 1;

                var lastToken = it.tokens[it.pos - 1];
                let str = lastToken.content.trim();
                cell.symbol = symbolMap.get(str) ?? MergeSymbol.None;
                this.hasMergeSymbol ||= (cell.symbol == MergeSymbol.None);

				this.cells.push(cell);

                row += 1;
                continue;
            }

            if (token.type === 'table_close')
            {
				it.advance();
				this.doInitCellMap();
                return true;
            }
        }

        return false;
	}


	mergeCell()
	{
		if (this.hasMergeSymbol)
        {
			this.doMergeCells();

			this.doAppendAttr();

			this.doRemoveMergedCells();

			this.doInitCellMap();
        }
	}



	doInitCellMap()
	{
		this.cellMap.clear();
		for (let cell of this.cells)
		{
			this.cellMap.set(cell.label(), cell);
		}
	}


    doMergeCells()
    {
        if (!this.hasMergeSymbol)
        {
            return;
        }

        var targetCell: TableCell | null = null;

        let rowCount = this.cells[this.cells.length - 1].row + 1;
        let columnCount = this.cells[this.cells.length - 1].column + 1;

        // 末尾から処理する
        for (var i = this.cells.length - 1; i >= 0; --i)
        {
            let cell = this.cells[i];

            if (cell.isRowEnd)
            {
                targetCell = null;
            }

            switch (cell.symbol)
            {
                case MergeSymbol.None:
                    targetCell = cell;
                    break;

                case MergeSymbol.Right:
                    if (targetCell != null)
                    {
                        targetCell.curRow -= 1;
                        targetCell.colspan += 1;
                        cell.colspan -= 1;
                    }
                    break;

                case MergeSymbol.Left:
                    if (cell.row >= 1)
                    {
                        this.cells[i - 1].colspan += cell.colspan;
                        cell.colspan = 0;
                    }
                    break;

                case MergeSymbol.Up:
                    if (cell.column >= 2)
                    {
                        this.cells[i - rowCount].rowspan += cell.rowspan;
                        cell.rowspan = 0;
                    }
                    break;
            }
        }
        // for (let cell of this.cells)
        // {
        //     console.log(cell.label() + ` colspan=${cell.colspan}` + ` rowspan=${cell.rowspan}`);
        // }
    }

    doAppendAttr()
    {
        for (let cell of this.cells)
        {
            if (cell.colspan >= 2)
            {
                cell.tokenOpen?.attrSet("colspan", `${cell.colspan}`);
            }

            if (cell.rowspan >= 2)
            {
                cell.tokenOpen?.attrSet("rowspan", `${cell.rowspan}`);
            }
        }
    }


    doRemoveMergedCells()
    {
        // 末尾から処理する
        for (var i = this.cells.length - 1; i >= 0; --i) {
            let cell = this.cells[i];
            let needDelete = (cell.rowspan == 0) || (cell.colspan == 0);
            if (!needDelete)
            {
				continue;
			}

			let cnt = cell.tokenEnd - cell.tokenBegin;
			this.tokens.splice(cell.tokenBegin, cnt);
			this.cells.splice(i, 1);
			for (var j = i; j < this.cells.length; ++j)
			{
				let c = this.cells[j];
				c.tokenBegin -= cnt;
				c.tokenEnd -= cnt;
			}
        }
    }


    updateCellContent(cellContent: TableItem)
    {
		let cell = this.cellMap.get(cellContent.label);
		if (cell == null)
		{
			return;
		}

		let lastToken = this.tokens[cell.tokenEnd - 2];
		lastToken.children = [];
		lastToken.content = cellContent.content;
		lastToken.type = 'html_block';
    }
}
















class MdcatTablePlugin
{
	md : MarkdownIt;
	options : MarkdownIt.Options;
	env : any;

	// table タグの前にあるToken
	beforeTableTokens: Token[] = [];

	// table タグ
	table = new MdcatTable();

	// セルの内容
	cellContents: TableItem[] = [];

	constructor(md : MarkdownIt, options : MarkdownIt.Options, env : any)
	{
		this.md = md;
		this.options = options;
		this.env = env;
    }

	render(src: string): string
	{
		var tokens = this.md.parse(src, this.env);

		if (this.init(tokens))
		{
			this.table.mergeCell();

			this.updateCellContent();

			tokens = this.table.tokens;
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


	init(tokens: Token[]): boolean
	{
		// table タグが始まるまでの Token を設定します
		let tableStartPos = this.findToken(tokens, 0, 'table_open');
		if (tableStartPos < 0)
		{
			return false;
		}
		this.beforeTableTokens = tokens.splice(0, tableStartPos);

		// table タグを読み込みます
		let tableEndPos = this.findToken(tokens, 1, 'table_close');
		if (tableEndPos < 0)
		{
			return false;
		}
		tableEndPos += 1;
		this.table.initCells(tokens.splice(0, tableEndPos));

		// セルの内容を読み込みます
		if (!this.initCellContents(tokens))
		{
			return false;
		}

		return true;
	}


	// セルの内容を読み込みます
	initCellContents(tokens: Token[]): boolean
	{
		this.cellContents = [];

		var it = new TokenIterator(tokens);

		while (!it.isEnd())
		{
			var item = this.tableItem_p(it);
			if (item == null)
			{
				it.advance();
			}
			else
			{
				let children = item.tokens;
				if ((children.length == 3) && (children[0].type == "paragraph_open"))
				{
					// <p>xxx</p> だけの場合
					item.content = children[1].content;
				}
				else
				{
					item.content = this.md.renderer.render(children, this.options, this.env);
				}
				this.cellContents.push(item);
			}
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

		item.tokens = it.tokens.slice(item.startPos, item.endPos);

		return item;
	}


	updateCellContent()
	{
		for (let c of this.cellContents)
		{
			this.table.updateCellContent(c);
		}
	}
}


export function mdcatTablePlugin(md : MarkdownIt, options : MarkdownIt.Options): MarkdownIt {

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






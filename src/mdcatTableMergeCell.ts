import MarkdownIt from 'markdown-it';
import Token from 'markdown-it/lib/token';
import { TokenIterator } from './mdcatTablePlugin'


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
    colspan: number;
    rowspan: number;
    symbol = MergeSymbol.None;
    tokenOpen: Token | null = null; 
    tokenBegin = 0;
    tokenEnd = 0;

    constructor(row: number, column: number)
	{
		this.row = row;
        this.column = column;
        this.colspan = 1;
        this.rowspan = 1;
	}


    label(): string
    {
        return `${this.column}-${this.row}`;
    }
}


export class TableMergeCell
{
    tokens: Token[] = [];
    cells: TableCell[] = [];
    hasMergeSymbol = false;

    initCells(it: TokenIterator): boolean
    {
        this.tokens = [];
        this.cells = [];

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
            this.tokens.push(token);
    
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
                let str = lastToken.content.trimLeft();
                cell.symbol = symbolMap.get(str) ?? MergeSymbol.None;
                this.hasMergeSymbol ||= (cell.symbol == MergeSymbol.None);
        
                this.cells.push(cell);
    
    
                row += 1;
                continue;
            }
    
            if (token.type === 'table_close')
            {
                it.advance();
                break;
            }
        }
        
        return true;
    }


    mergeCells()
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

    appendAttr()
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
//            cell.tokenOpen?.attrSet("style", "text-align:right");
        }
    }

    removeCells()
    {
        // 末尾から処理する
        for (var i = this.cells.length - 1; i >= 0; --i) {
            let cell = this.cells[i];
            let needDelete = (cell.rowspan == 0) || (cell.colspan == 0);
            if (needDelete)
            {
                this.tokens.splice(cell.tokenBegin, cell.tokenEnd - cell.tokenBegin);
            }
        }
    }    
}




export function mergeTableCell(it: TokenIterator): Token[] | null
{
    let m = new TableMergeCell();
    
    if (!m.initCells(it))
    {
        return null;
    }

    m.mergeCells();
    m.appendAttr();
    m.removeCells();

    return m.tokens;
}



export function mdcatTableMergeCell(md : MarkdownIt, options : MarkdownIt.Options): MarkdownIt {
  
	const defaultRender = md.renderer.rules.fence;


	md.renderer.rules.fence = (tokens, idx, options, env, self) => {
	
		let token = tokens[idx];
		let info = token.info ? String(token.info).trim() : "";
		
		if (info === "mdcat.table")
		{
            console.log(token.content);

//			return m.render(token.content);
		}

		return defaultRender?.(tokens, idx, options, env, self).toString() ?? "";
	};

	return md;
}
  

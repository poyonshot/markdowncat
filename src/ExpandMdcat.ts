import * as vscode from "vscode";
import * as path from "path";
import { writeFile, appendFile, readFile, appendFileSync, readFileSync, writeFileSync, statSync, unlinkSync } from 'fs';
import { DocIterator } from "./DocIterator";
import { DocBufferTextDocument, DocBufferBinary } from "./DocBuffer";
import { space_p, eol_p, line_comment_p, block_comment_p, line_any_p } from "./parser/common_p";
import * as md from "./parser/markdown_p";
import * as mdcat from "./parser/mdcat_p";
import { extractExtentision, getEOL } from "./mdcatUtility";
import { ExclusionHeader } from "./ExclusionHeader";
import { MdcatSettings } from "./MdcatSettings";
import MarkdownIt from "markdown-it";


export class ExpandMdcat
{
    doc: vscode.TextDocument;
    docDir: string;
    outputFilePath: string;
    eol : string;

    settings = new MdcatSettings();        
    exclusionHeader: ExclusionHeader | null = null;
    includingFile: string | null = null;

    static mdIt: MarkdownIt | null = null;
    static mdItOp: MarkdownIt.Options = {};
    static mdItEnv: any = {};

    constructor(doc: vscode.TextDocument)
    {
        this.doc = doc;
        this.outputFilePath = this.getOutputFilePath(doc.fileName);
        this.docDir = path.dirname(this.outputFilePath);
        this.eol = getEOL(this.doc);
    }

    getOutputFilePath(mdcatPath: string)
    {
        var s = "";
        s += path.dirname(mdcatPath);
        s += path.sep;
        s += path.basename(mdcatPath, path.extname(mdcatPath));
        s += '.md';
        return s;
    }

    loadSettings(): string
    {
        var it = new DocIterator(new DocBufferTextDocument(this.doc));

        var jsonSrc = "";

        while (!it.isEnd())
        {
            // スペース, 改行
            if (space_p(it) || eol_p(it))
            {
                continue;
            }

            // コメント
            if (line_comment_p(it) || block_comment_p(it))
            {
                continue;
            }

            if (mdcat.settings_p(it, json => { jsonSrc = json; }))
            {  
                return this.onSettings(jsonSrc);
            }

            // 改行まで読み捨て
            if  (line_any_p(it))
            {
                continue;
            }
        }

        return "";
    }

    run()
    {
        this.deleteWorkFiles();

        writeFileSync(this.outputFilePath, "");
        
        var it = new DocIterator(new DocBufferTextDocument(this.doc));

        while (!it.isEnd())
        {
            // スペース, 改行
            while (space_p(it) || eol_p(it))
            {
                this.onOutputMatched(it);
            }

            // コメント
            if (line_comment_p(it) || block_comment_p(it))
            {
                this.onDiscardMatched(it)
                continue;
            }

            if (it.top() == "$")
            {
                // インクルードファイルを展開
                if (mdcat.include_p(it, filepath => this.onInclude(filepath))
                || mdcat.newpage_p(it, () => this.onNewpage())
                || mdcat.settings_p(it, json => {})
                ){
                    this.onDiscardMatched(it)
                    continue;
                }
            }

            // そのままコピー
            if  (line_any_p(it))
            {
                this.onOutputMatched(it);
                continue;
            }
        }
    }

    deleteWorkFiles(): void
    {
        this.settings.exclusionHeaders.forEach((header) => {
            let filePath = ExclusionHeader.createWorkFilePath(this.outputFilePath, header);
            try {
                statSync(filePath);
                unlinkSync(filePath);
            } catch (error) {
                // if (error.code === 'ENOENT') {
                //   console.log('ファイル・ディレクトリは存在しません。');
                // } else {
                //   console.log(error);
                // }
            }
        });
    }

    onOutputMatched(it: DocIterator, str: string | null = null): void
    {
        if (str == null)
        {
            str = it.getMatched();            
        }
        if (str.length > 0)
        {
            appendFileSync(this.outputFilePath, str)
        }
        it.discardMatched();
    }

    onDiscardMatched(it: DocIterator): void
    {
        it.discardMatched();
    }

    onSettings(json: string): string
    {
        this.settings.loadConfiguration();        
        return this.settings.load(json);
    }

    onNewpage(): void
    {
        var str = this.settings.newpage;
        str += this.eol;
        appendFileSync(this.outputFilePath, str);
    }

    onInclude(filepath: string): void
    {
        let data = readFileSync(this.docDir + path.sep + filepath)
        let ext = extractExtentision(filepath);
        this.includingFile = filepath;

        appendFileSync(this.outputFilePath, "<!-- " + filepath + " -->" + this.eol)

        switch (ext)
        {
        case "css": this.onIncludeCSS(data); break;
        case "md":  this.onIncludeMD(data); break;
        default:    appendFileSync(this.outputFilePath, data); break;
        }
        this.includingFile = null;
    }

    onIncludeCSS(data: Buffer): void
    {
	    appendFileSync(this.outputFilePath, "<style>" + this.eol);	
		appendFileSync(this.outputFilePath, data);
		appendFileSync(this.outputFilePath, "</style>" + this.eol);
    }

    onIncludeMD(data: Buffer): void
    {
        var it = new DocIterator(new DocBufferBinary(data));

        while (!it.isEnd())
        {
            if (space_p(it)
            || eol_p(it)
            || md.comment_p(it)
            || md.header_p(it, (level, header) => this.onMdHeader(level, header))
            ){
                this.onMdOutput(it);
                continue;
            }

            if (md.code_block_p(it, "mdcat.table")
            ){
                let str = this.onMdcatTable(it.getMatched());
                this.onMdOutput(it, str);
                continue;
            }
            
            if (md.code_block_p(it)
            || line_any_p(it)
            ){
                this.onMdOutput(it);
                continue;
            }
        }
    }




    onMdOutput(it: DocIterator, str: string | null = null): void
    {
        if (this.exclusionHeader != null)
        {
            if (this.exclusionHeader.workFilePath)
            {
                appendFileSync(this.exclusionHeader.workFilePath, it.getMatched());    
            }
            this.onDiscardMatched(it);
        }
        else
        {
            this.onOutputMatched(it, str);
        }
    }

    onMdHeader(level: number, header: string):void
    {       
        if (this.exclusionHeader != null)
        {
            if (level > this.exclusionHeader.level)
            {
                return;
            }
            this.exclusionHeader = null;
        }

        if (this.exclusionHeader == null)
        {
            if (this.settings.exclusionHeaders.includes(header))
            {
                this.exclusionHeader = {
                    level : level,
                    header : header,
                    workFilePath : ExclusionHeader.createWorkFilePath(this.outputFilePath, header)       
                }

                if (this.exclusionHeader.workFilePath)
                {
                    let str = "\n\n***" + this.includingFile + "***\n";
                    appendFileSync(this.exclusionHeader.workFilePath, str);    
                }
            }
        }
    }

    onMdcatTable(src: string): string
    {
        if (ExpandMdcat.mdIt)
        {
            return ExpandMdcat.mdIt.render(src, {});
//            const m = new MdcatTablePlugin(ExpandMdcat.mdIt, ExpandMdcat.mdItOp, ExpandMdcat.mdItEnv);
//            return m.render(src);    
        }
        else 
        {
            throw { message : "You only need to open the .md file once to convert the mdcat.table code block." };
            //return src;
        }
    }
}

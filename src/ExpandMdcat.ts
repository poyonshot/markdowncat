import * as vscode from "vscode";
import * as path from "path";
import { writeFile, appendFile, readFile, appendFileSync, readFileSync, writeFileSync, statSync, unlinkSync } from 'fs';
import { DocIterator } from "./DocIterator";
import { DocBufferTextDocument, DocBufferBinary } from "./DocBuffer";
import { space_p, eol_p, line_comment_p, block_comment_p, line_any_p } from "./parser/common_p";
import { include_p } from "./parser/include_p";
import * as md from "./parser/markdown_p";
import { settings_p } from "./parser/settings_p";
import { extractExtentision } from "./mdcatUtility";
import { ExclusionHeader } from "./ExclusionHeader";


export class ExpandMdcat
{
    doc: vscode.TextDocument
    docDir: string
    outputFilePath: string
    eol : string
    
    exclusionHeaders: string[]
    exclusionHeader: ExclusionHeader | null = null;

    includingFile: string | null = null;

    constructor(doc: vscode.TextDocument)
    {
        this.doc = doc;
        this.outputFilePath = this.getOutputFilePath(doc.fileName);
        this.docDir = path.dirname(this.outputFilePath);
        this.eol = (this.doc.eol == vscode.EndOfLine.CRLF) ? "\r\n" : "\n";
        this.exclusionHeaders = [];
    }

    getOutputFilePath(mdcatPath: string)
    {
        var s = ""
        s += path.dirname(mdcatPath)
        s += path.sep
        s += path.basename(mdcatPath, path.extname(mdcatPath))
        s += '.md'
        return s
    }

    run()
    {
        this.deleteWorkFiles();

        writeFileSync(this.outputFilePath, "")
        
        var it = new DocIterator(new DocBufferTextDocument(this.doc))

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
                if (include_p(it, filepath => this.onInclude(filepath)))
                {
                    this.onDiscardMatched(it)
                    continue;
                }

                if (settings_p(it, str => this.onSettings(str)))
                {                
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
        this.exclusionHeaders.forEach((header) => {
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

    onOutputMatched(it: DocIterator): void
    {
        let str = it.getMatched();
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

    onSettings(str: string): void
    {
        // appendFileSync(this.outputFilePath, "<!-- " + json + " -->" + this.eol)
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
	    appendFileSync(this.outputFilePath, "<style>" + this.eol)	
		appendFileSync(this.outputFilePath, data)
		appendFileSync(this.outputFilePath, "</style>" + this.eol)
    }

    onIncludeMD(data: Buffer): void
    {
        var it = new DocIterator(new DocBufferBinary(data));

        while (!it.isEnd())
        {
            // スペース, 改行
            while (space_p(it) || eol_p(it))
            {
                this.onMdOutput(it);
            }

            // 見出し
            if (md.header_p(it, (level, header) => this.onMdHeader(level, header)))
            {
                this.onMdOutput(it);
                continue;
            }

            // そのままコピー
            if  (line_any_p(it))
            {
                this.onMdOutput(it);
                continue;
            }
        }
    }




    onMdOutput(it: DocIterator): void
    {
        if (this.exclusionHeader != null)
        {
            if (this.exclusionHeader.workFilePath)
            {
                appendFileSync(this.exclusionHeader.workFilePath, it.getMatched());    
            }
            this.onDiscardMatched(it)
        }
        else
        {
            this.onOutputMatched(it);
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
            if (this.exclusionHeaders.includes(header))
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
}

import * as vscode from "vscode";
import * as path from "path";
import { writeFile, appendFile, readFile, appendFileSync, readFileSync, writeFileSync, fstatSync } from 'fs';
import { DocIterator } from "./DocIterator";
import { DocBufferTextDocument } from "./DocBuffer";
import { space_p, line_comment_p, block_comment_p, line_any_p } from "./parser/common_p";
import { include_p } from "./parser/include_p";


export class ExpandMdcat
{
    doc: vscode.TextDocument
    outputFilePath: string

    constructor(doc: vscode.TextDocument)
    {
        this.doc = doc;
        this.outputFilePath = this.getOutputFilePath(doc.fileName);
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
        writeFileSync(this.outputFilePath, "")
        

        var it = new DocIterator(new DocBufferTextDocument(this.doc))
        it.docDir =  path.dirname(this.outputFilePath);
        it.outFilename = this.outputFilePath
        it.eol = (this.doc.eol == vscode.EndOfLine.CRLF) ? "\r\n" : "\n";

        while (!it.isEnd())
        {
            it.readLine();

            // スペース
            if (space_p(it))
            {
                this.onOutputMatched(it);
                continue;
            }

            // コメント
            if (line_comment_p(it) || block_comment_p(it))
            {
                this.onDiscardMatched(it)
                continue;
            }

            // インクルードファイルを展開
            if (include_p(it, this.onInclude))
            {
                this.onDiscardMatched(it)
                continue;
            }
            
            // そのままコピー
            if  (line_any_p(it))
            {
                this.onOutputMatched(it);
                continue;
            }
        }

        it.flush();
        this.onOutputMatched(it)
    }


    onOutputMatched(it: DocIterator): void
    {
        let str = it.matchedString();
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

    onInclude(filepath: string): void
    {

    }
}
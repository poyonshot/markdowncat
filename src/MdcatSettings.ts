import * as vscode from "vscode";


export class MdcatSettings
{
    newpage: string = "";
    exclusionHeaders: string[] = [];
    includingFile: string | null = null;
    mdcatTableName: string = "";
    mdcatTableConvertHtml: boolean = true;

    static snippetSettings(eol: string): string
    {
        return '{' + eol
            + '    "newpage" : null,' + eol
            + '    "exclusion" : { "headers" : [] },' + eol
            + '    "table" : { "convertHtml" : false }' + eol
            + '}' + eol;    
    }
    
    static snippetNewline(): string
    {
        return "<div style=\"page-break-before:always\"></div>";
    }

    loadConfiguration()
    {         
        this.exclusionHeaders = vscode.workspace.getConfiguration().get('markdowncat.exclusion.headers') || [];
        this.newpage = vscode.workspace.getConfiguration().get('markdowncat.newpage') || MdcatSettings.snippetNewline();
        this.mdcatTableName = vscode.workspace.getConfiguration().get('markdowncat.table.codeBlockName') || "";
        if (this.mdcatTableName == "") 
        {
            this.mdcatTableName = "mdcat.table";
        }
        this.mdcatTableConvertHtml = vscode.workspace.getConfiguration().get('markdowncat.table.convertHtml') || false;
    }


    load(json: string): string
    {    
        // appendFileSync(this.outputFilePath, "<!-- " + json + " -->" + this.eol)
		try {
            let obj = JSON.parse(json);
            this.onNewPage(obj["newpage"]);
            this.onExclusion(obj["exclusion"]);
            this.onTable(obj["table"]);
            return "";
		} catch (err) {
            //console.error(err);
            return err.message;
        }
    }

    onNewPage(value: any)
    {
        if (value == null)
        {
            return;
        }

        if (typeof value !== 'string')
        {
            throw { message : "Type mismatch : newpage" };
        }

        this.newpage = value;
    }

    onExclusion(value: any)
    {
        if (value == null)
        {
            return;
        }

        if (typeof value !== 'object')
        {
            throw { message : "Type mismatch : exclusion" };
        }
         
        let headers = value["headers"];
        if (!(headers instanceof Array))
        {
            throw { message : "Type mismatch : exclusion.headers" };
        }

        for (let i in headers)
        {
            let h = headers[i];
            if (typeof h !== 'string')
            {
                throw { message : `Type mismatch : exclusion.headers[${i}]` };
            }    
        }

        this.exclusionHeaders = headers;
    }
    
    onTable(value: any)
    {
        if (value == null)
        {
            return;
        }

        if (typeof value !== 'object')
        {
            throw { message : "Type mismatch : exclusion" };
        }

        let codeBlockName = value["codeBlockName"];
        if (codeBlockName != null)
        {
            throw { message : "Not supported in $settings : table.codeBlockName" };
        }
        
        let convertHtml = value["convertHtml"];
        if (convertHtml == null)
        {
            // noop
        }
        else if (typeof convertHtml === 'boolean')
        {
            this.mdcatTableConvertHtml = convertHtml;
        }
        else
        {
            throw { message : "Type mismatch : table.convertHtml" };
        }
    }

}
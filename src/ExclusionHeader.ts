import * as path from "path";


export class ExclusionHeader 
{        
    level = 0;
    header = "";
    workFilePath: string | null = null;

    static createWorkFilePath(mdcatPath: string, header: string)
    {
        var s = "";
        s += path.dirname(mdcatPath);
        s += path.sep;
        s += path.basename(mdcatPath, path.extname(mdcatPath));
        s += '.mdcat.';
        s += header;
        s += '.md';
        return s;
    }
}

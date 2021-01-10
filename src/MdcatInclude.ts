import { notDeepEqual } from "assert";
import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token";
import { MdcatTablePlugin } from "markdown-it-mdcat-table";


enum NodeType
{
    Blank = 0,
    Comment = 1,
    Heading = 2,
    Paragraph = 3,
    Fence = 4,
}


class Node {
    type = NodeType.Blank;
    begin = 0;
    end = 0;
}


export class MdcatInclude
{    
    md: MarkdownIt;

    src = "";
    srcMap: [number,number][] = [];
    tokens: Token[] = [];

    constructor()
    {
        this.md = MarkdownIt()
                    //.use(mdcatTablePlugin);
    }

    run(mdStr: string)
    {
        this.src = mdStr;
        this.initSrcMap(this.src);
        this.tokens = this.md.parse(this.src, {});
        let nodes = this.createNodes(this.tokens);

        for (let node of nodes)
        {
            let str = this.toStrMd(node);
            console.log(str);
        }

//        let s = m.renderer.render(this.tokens, {}, {});
//        console.log(s);
    }


    initSrcMap(src: string)
    {
        this.srcMap = [];
        var begin = 0;
        for (var pos = begin; pos < src.length; ++pos)
        {
            if (src.charAt(pos) == "\n")
            {
                this.srcMap.push([begin, pos + 1]);
                begin = pos + 1;
            }
        }
        if (begin < src.length)
        {
            this.srcMap.push([begin, src.length]);
        }        
    }

    createNodes(tokens: Token[]): Node[]
    {
        var nodes: Node[] = [];
 
        for (var pos = 0; pos < tokens.length; )
        {
            let node = this.createNode(tokens, pos);

            if (pos != node.begin)
            {
                let blankNode = new Node();
                blankNode.type = NodeType.Blank;
                blankNode.begin = pos;
                blankNode.end = node.begin;
                nodes.push(blankNode);
            }

            nodes.push(node);
            pos = node.end;
        }
        
        return nodes;
    }


    createNode(tokens: Token[], pos: number, mergeComment: boolean = true): Node
    {
        let m = new Node();
        m.begin = pos;

        var token = tokens[pos];

        if (token.type == "paragraph_open")
        {
            var node = this.createNodeParagraph(tokens, pos);
            if (node != null)
            { 
                let str = tokens[node.begin + 1].content.substr(0, 4);      
                if (!mergeComment || (str != "<!--"))
                {
                    return node;
                }

                var commentTokenBegin = node.begin;
                pos = node.end;
                while ((node != null) && (pos < tokens.length))
                {
                    node = this.createNode(tokens, pos, false);
                    if (node == null)
                    {
                        break;
                    }
                    pos = node.end;
                    if (node.type == NodeType.Paragraph)
                    { 
                        var endContent = tokens[node.begin + 1].content;
                        endContent = endContent.substr(-3);      
                        if (endContent == "-->")
                        {       
                            node.type = NodeType.Comment;
                            node.begin = commentTokenBegin;
                            return node;
                        }
                    }
                }
            }
        }
        
        if (token.type == "heading_open")
        {
            let node = this.createNodeHeading(tokens, pos);
            if (node != null)
            {
                return node;
            }
        }
        
        if (token.type == "fence")
        {
            m.type = NodeType.Fence;
            m.end = pos + 1;
            return m;
        }

        m.type = NodeType.Blank;
        m.end = tokens.length;        
        return m;
    }

    createNodeParagraph(tokens: Token[], pos: number): Node | null
    {     
        let m = new Node();
        m.type = NodeType.Paragraph;
        m.begin = pos;
        for(; pos < tokens.length; pos++)
        {
            let token = tokens[pos];               
            if (token.type == "paragraph_close")
            {
                pos++;
                m.end = pos;
                return m;
            }
        }
        return null;
    }

    createNodeHeading(tokens: Token[], pos: number): Node | null
    {     
        let m = new Node();           
        m.type = NodeType.Heading;
        m.begin = pos;
        for(; pos < tokens.length; pos++)
        {
            let token = tokens[pos];               
            if (token.type == "heading_close")
            {
                pos++;
                m.end = pos;
                return m;
            }
        }
        return null;
    }


    toStrMd(node: Node): string
    {
        var token = this.tokens[node.begin];

        var lineBegin = token.map?.[0] ?? 0;
        var lineEnd = token.map?.[1] ?? 0;

        switch (node.type)
        {
            case NodeType.Fence:
                if (token.info == "mdcat.table")
                {			
                    const m = new MdcatTablePlugin(this.md, {}, {});
                    return m.render(token.content);
                }
                break;

            case NodeType.Comment:
                token = this.tokens[node.end - 3];
                lineEnd = token.map?.[1] ?? 0;
                break;
        }

        let srcBegin = this.srcMap[lineBegin][0];
        let srcEnd = this.srcMap[lineEnd][0];
        return this.src.substr(srcBegin, srcEnd - srcBegin);
    }
}

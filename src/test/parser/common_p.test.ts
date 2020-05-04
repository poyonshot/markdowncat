import * as vscode from "vscode";
import * as assert from 'assert';
import { DocIterator } from "../../DocIterator";
import { DocBufferBinary } from "../../DocBuffer";
import { space_p, line_comment_p, block_comment_p } from "../../parser/common_p";
import { isAbsolute } from "path";


suite("space_p Tests", function () {

    // Defines a Mocha unit test
    test("1", function() {

        let doc = new DocBufferBinary(Buffer.from(""));
        let it = new DocIterator(doc);

        it.lineStr = " $settings= { }";
        assert.equal(true, space_p(it));
    });

    test("2", function() {

        let doc = new DocBufferBinary();
        let it = new DocIterator(doc);

        it.lineStr = "   ";
        assert.equal(true, space_p(it));
        assert.equal(3, it.column);
        assert.equal("   ", it.matchedString());
    });
});


suite("line_comment_p Tests", function () {

    test("1", function() {
        let doc = new DocBufferBinary();
        let it = new DocIterator(doc);

        it.lineStr = "// abc ";
        assert.equal(true, line_comment_p(it));
        assert.equal(7, it.column);
        assert.equal("// abc ", it.matchedString());
    });
});


suite("block_comment_p Tests", function () {

    function testIterator(str: string): DocIterator
    {
        let doc = new DocBufferBinary(Buffer.from(str));
        let it = new DocIterator(doc);
        it.readLine();        
        return it;
    }

    test("1", function() {
        let str = "/* あいう */  ";
        let it = testIterator(str);
        assert.equal(true, block_comment_p(it));
        assert.equal(9, it.column);
        assert.equal("/* あいう */", it.matchedString());
    });
    
    test("2", function() {
        let str = "/* あいう \n ABC */  ";
        let it = testIterator(str);
        assert.equal(true, block_comment_p(it));
        assert.equal(15, it.column);
        assert.equal("/* あいう \n ABC */", it.matchedString());
    });
});

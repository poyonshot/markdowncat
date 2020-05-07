import * as vscode from "vscode";
import * as assert from 'assert';
import { DocIterator } from "../../DocIterator";
import { DocBufferBinary } from "../../DocBuffer";
import { space_p, line_comment_p, block_comment_p } from "../../parser/common_p";
import { isAbsolute } from "path";


function testIterator(str: string): DocIterator
{
    let doc = new DocBufferBinary(Buffer.from(str));
    let it = new DocIterator(doc);
    it.readLine();        
    return it;
}


suite("space_p Tests", function () {

    // Defines a Mocha unit test
    test("1", function() {

        let it = testIterator(" $settings= { }");
        it.readLine();

        assert.equal(true, space_p(it));
    });

    test("2", function() {

        let it = testIterator("   ");

        assert.equal(true, space_p(it));
        assert.equal(3, it.pos);
        assert.equal("   ", it.getMatched());
    });
});


suite("line_comment_p Tests", function () {

    test("1", function() {
        let it = testIterator("// abc ");
        assert.equal(true, line_comment_p(it));
        assert.equal(7, it.pos);
        assert.equal("// abc ", it.getMatched());
    });
});


suite("block_comment_p Tests", function () {

    test("1", function() {
        let str = "/* あいう */  ";
        let it = testIterator(str);
        assert.equal(true, block_comment_p(it));
        assert.equal(9, it.pos);
        assert.equal("/* あいう */", it.getMatched());
    });
    
    test("2", function() {
        let str = "/* あいう *//*ABC*/";
        let it = testIterator(str);
        assert.equal(true, block_comment_p(it));
        assert.equal(9, it.pos);
        assert.equal("/* あいう */", it.getMatched());
        it.discardMatched();
        assert.equal(true, block_comment_p(it));
        assert.equal(7, it.pos);
        assert.equal("/*ABC*/", it.getMatched());
    });

    test("3", function() {
        let str = "/* あいう \n ABC */  ";
        let it = testIterator(str);
        assert.equal(true, block_comment_p(it));
        assert.equal(15, it.pos);
        let s1 = it.getMatched();
        let s2 = Buffer.from(s1);
        let s3 = Buffer.from("/* あいう \n ABC */");
        assert.equal(s2, s3);
        assert.deepEqual(s2, s3);
        assert.equal("/* あいう \n ABC */", it.getMatched());
    });
});

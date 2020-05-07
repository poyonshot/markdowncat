import * as vscode from "vscode";
import * as assert from 'assert';
import { DocIterator } from "../../DocIterator";
import { DocBufferBinary } from "../../DocBuffer";
import { space_p, line_comment_p, block_comment_p } from "../../parser/common_p";
import * as js from "../../parser/javascript_p";


function testIterator(str: string): DocIterator
{
    let doc = new DocBufferBinary(Buffer.from(str));
    let it = new DocIterator(doc);
    it.readLine();        
    return it;
}


suite("javascript Tests", function () {

    // Defines a Mocha unit test
    test("string_p 1", function() {

        var items = [
            [true, '""'],
            [true, '"あいう"'],
            [true, '"ABC"'],
            [true, '"123"'],
            [true, '"123  カキク"'],
            [true, '"  "  "'],
            [true, "\"  \\\"  \""],
            [false, '"123'],
            [false, '"123  \n カキク"'],
        ];

        items.forEach(item => {
            var it = testIterator(item[1] as string);
            assert.equal(item[0] as boolean, js.string_p(it), item[1] as string);    
        });
    });

    test("object_p 1", function() {

        var items = [
            [true, '{}'],
            [true, '{ abc : 1}'],
            [true, '{ abc :\n 1}'],
            [true, '{ a : 1, b : null}'],
            [true, '{ a : "", b: 1.2 }'],
            [true, '{ a : "{", b: \'{\' }'],
            [true, '{ a : {}}'],
            [true, '{ a : { b: { c: { d: {}}}}}'],
            [false, '{ a : { b: { c: { d: {}}}}'],
            [true, '{ a : { b: { c\n: { d: {}}}\n}}'],
            [false, '{'],
        ];

        items.forEach(item => {
            var it = testIterator(item[1] as string);
            assert.equal(item[0] as boolean, js.object_p(it), item[1] as string);    
        });
    });

});
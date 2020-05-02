import * as vscode from "vscode";
import * as assert from 'assert';
import { DocIterator } from "../DocIterator";
import { DocBufferBinary } from "../DocBuffer";
import { TextDocumentMock } from "./TextDocumentMock";




suite("DocIterator Tests", function () {

    // Defines a Mocha unit test
    test("str 1", function() {

        let doc = new TextDocumentMock();
        let it = new DocIterator(doc);

        it.lineStr = "123456789";
        assert.equal("", it.str(0, 0));
        assert.equal("1", it.str(0, 1));
        assert.equal("12", it.str(0, 2));
        assert.equal("123", it.str(0, 3));
        
        assert.equal("", it.str(1, 0));
        assert.equal("2", it.str(1, 1));
        assert.equal("23", it.str(1, 2));
        assert.equal("234", it.str(1, 3));
        
        it.column = 1;
        assert.equal("", it.str(0, 0));
        assert.equal("2", it.str(0, 1));
        assert.equal("23", it.str(0, 2));
        assert.equal("234", it.str(0, 3));

        it.column = 4;
        assert.equal("", it.str(1, 0));
        assert.equal("6", it.str(1, 1));
        assert.equal("67", it.str(1, 2));
        assert.equal("678", it.str(1, 3));
        
        assert.equal("8", it.str(3, 1));
        assert.equal("89", it.str(3, 2));
        assert.equal("89", it.str(3, 3));
    });


    
    test("str 2", function() {
        let m = new DocBufferBinary(new Buffer("あいう\r\n\nえお"));
        let s  = m.readLine();
        let s1  = m.readLine();
        let s2  = m.readLine();
        let b = new Buffer(s.trimRight());
        assert.equal("89", m.readLine);
    });
});
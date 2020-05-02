import * as vscode from "vscode";
import * as assert from 'assert';
import { DocIterator } from "../../DocIterator";
import { TextDocumentMock } from "../TextDocumentMock";
import { space_p, line_comment_p } from "../../parser/common_p";


suite("common_p Tests", function () {

    // Defines a Mocha unit test
    test("space_p", function() {

        let doc = new TextDocumentMock();
        let it = new DocIterator(doc);

        it.lineStr = " $settings= { }";
        assert.equal(true, space_p(it));
    });

});
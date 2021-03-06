import * as vscode from "vscode";
import * as assert from 'assert';
import { DocIterator } from "../../DocIterator";
import { DocBufferBinary } from "../../DocBuffer";
import { settings_p } from "../../parser/mdcat_parser/settings_p";
    
function createTestIterator(str: string): DocIterator
{
    let doc = new DocBufferBinary(Buffer.from(str));
    let it = new DocIterator(doc);
    it.readLine();
    return it;
}

suite("settings_2p Tests", function () {

    // Defines a Mocha unit test
    test("1", function() {

        var it = createTestIterator(" $settings= { }");
        assert.equal(false, settings_p(it, json => null));
        
        it = createTestIterator("$settings");
        assert.equal(false, settings_p(it, json => null));
    });

    test("2", function() {


        var it = createTestIterator("$settings= { }");
        assert.equal(true, settings_p(it, json => null));
        
        it = createTestIterator("$settings  \t  = { }");
        assert.equal(true, settings_p(it, json => null));
    });
});
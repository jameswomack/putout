'use strict';

const fs = require('fs');
const {join} = require('path');

const test = require('supertape');
const mockRequire = require('mock-require');
const stub = require('@cloudcmd/stub');
const putout = require('../putout');

const {reRequire, stopAll} = mockRequire;
const {assign} = Object;

const {readFile} = fs.promises;

test('putout: cli: process-file: eslint', async (t) => {
    const eslint = stub().returns(['', []]);
    
    const source = 'log123("hello")';
    const fix = false;
    const name = 'example.js';
    const log = stub();
    const ruler = {};
    const write = stub();
    const fileCache = {
        canUseCache: stub().returns(false),
        setInfo: stub(),
    };
    
    mockRequire('./eslint', eslint);
    
    const processFile = reRequire('./process-file');
    const fn = processFile({
        fix,
        log,
        ruler,
        write,
        fileCache,
    });
    
    await fn({
        name: 'example.js',
        source,
        index: 0,
        length: 1,
    });
    
    stopAll();
    
    const expected = {
        code: source,
        fix,
        name,
    };
    
    t.ok(eslint.calledWith(expected), 'should call eslint');
    t.end();
});

test('putout: cli: process-file: fileCache.removeEntry', async (t) => {
    const eslint = stub().returns(['', []]);
    
    const source = 'var x = 5';
    const fix = true;
    const name = 'example.js';
    const log = stub();
    const ruler = {};
    const write = stub();
    const fileCache = {
        canUseCache: stub().returns(false),
        removeEntry: stub(),
        setInfo: stub(),
    };
    
    mockRequire('./eslint', eslint);
    
    const processFile = reRequire('./process-file');
    const fn = processFile({
        fix,
        log,
        ruler,
        write,
        fileCache,
    });
    
    await fn({
        name: 'example.js',
        source,
        index: 0,
        length: 1,
    });
    
    stopAll();
    
    t.ok(fileCache.removeEntry.calledWith(name), 'should call fileCache.removeEntry');
    t.end();
});

test('putout: cli: process-file: cache', async (t) => {
    const eslint = stub().returns(['', []]);
    const source = 'var x = 5';
    const fix = true;
    const name = 'example.js';
    const log = stub();
    const ruler = {};
    const write = stub();
    const fileCache = {
        canUseCache: stub().returns(true),
        removeEntry: stub(),
        setInfo: stub(),
        getPlaces: stub().returns([]),
    };
    
    mockRequire('./eslint', eslint);
    
    const processFile = reRequire('./process-file');
    const fn = processFile({
        fix,
        log,
        ruler,
        write,
        fileCache,
    });
    
    await fn({
        name: 'example.js',
        source,
        index: 0,
        length: 1,
    });
    
    stopAll();
    
    t.ok(fileCache.getPlaces.calledWith(name), 'should call fileCache.getPlaces');
    t.end();
});

test('putout: cli: process-file: parse error', async (t) => {
    const noConfig = true;
    const fix = false;
    const log = stub();
    const ruler = {};
    const write = stub();
    const exit = stub();
    const fileCache = {
        canUseCache: stub().returns(false),
        removeEntry: stub(),
        setInfo: stub(),
        getPlaces: stub().returns([]),
    };
    
    const formatter = stub();
    mockRequire('@putout/formatter-dump', formatter);
    
    const eslint = stub().returns(['', []]);
    mockRequire('./eslint', eslint);
    
    const processFile = reRequire('./process-file');
    const fn = processFile({
        fix,
        log,
        ruler,
        write,
        fileCache,
        formatter,
        noConfig,
        exit,
        debug: true,
    });
    
    const name = join(__dirname, './fixture/parse-error.js');
    const source = await readFile(name, 'utf8');
    
    await fn({
        name,
        source,
        index: 0,
        length: 1,
    });
    
    stopAll();
    
    const expected = {
        count: 1,
        errorsCount: 1,
        filesCount: 1,
        index: 0,
        name,
        options: {},
        places: [{
            message: 'Unexpected token ',
            position: {
                column: 0,
                line: 2,
            },
            rule: 'crash/parser',
        }],
        source,
    };
    
    t.ok(formatter.calledWith(expected), 'should call formatter');
    t.end();
});

test('putout: cli: process-file: parse error: on plugin', async (t) => {
    const noConfig = true;
    const fix = false;
    const log = stub();
    const ruler = {};
    const write = stub();
    const exit = stub();
    const fileCache = {
        canUseCache: stub().returns(false),
        removeEntry: stub(),
        setInfo: stub(),
        getPlaces: stub().returns([]),
    };
    
    const name = join(__dirname, './fixture/view.tsx');
    const source = await readFile(name, 'utf8');
    const formatter = stub();
    const putoutStub = putout.bind(putout, source, {
        isTS: true,
        plugins: [
            ['hello', {
                fix: stub(),
                find: () => {
                    throw Error('x');
                },
            }],
        ],
    });
    
    assign(putoutStub, putout);
    
    mockRequire('@putout/formatter-dump', formatter);
    mockRequire('../putout', putoutStub);
    
    const processFile = reRequire('./process-file');
    const fn = processFile({
        fix,
        log,
        ruler,
        write,
        fileCache,
        formatter,
        noConfig,
        exit,
        debug: true,
    });
    
    await fn({
        name,
        source,
        index: 0,
        length: 1,
    });
    
    stopAll();
    
    const {args} = formatter;
    const [first] = args;
    const [{places}] = first;
    const {message} = places[0];
    
    t.equal(message, 'x', 'should equal');
    t.end();
});

test('putout: cli: process-file: parse error: debug', async (t) => {
    const noConfig = true;
    const fix = false;
    const log = stub();
    const ruler = {};
    const write = stub();
    const exit = stub();
    const fileCache = {
        canUseCache: stub().returns(false),
        removeEntry: stub(),
        setInfo: stub(),
        getPlaces: stub().returns([]),
    };
    
    const formatter = stub();
    const putout = stub().throws('xxx');
    const eslint = stub().returns(['', []]);
    
    mockRequire('./eslint', eslint);
    mockRequire('../../putout', putout);
    mockRequire('@putout/formatter-dump', formatter);
    
    const processFile = reRequire('./process-file');
    const fn = processFile({
        fix,
        log,
        ruler,
        write,
        fileCache,
        formatter,
        noConfig,
        exit,
        debug: true,
    });
    
    const name = join(__dirname, './fixture/parse-error.js');
    const source = await readFile(name, 'utf8');
    
    await fn({
        name,
        source,
        index: 0,
        length: 1,
    });
    
    stopAll();
    
    const expected = {
        count: 1,
        errorsCount: 1,
        filesCount: 1,
        index: 0,
        name,
        options: {},
        places: [{
            message: 'Unexpected token ',
            position: {
                column: 0,
                line: 2,
            },
            rule: 'crash/parser',
        }],
        source,
    };
    
    t.ok(formatter.calledWith(expected), 'should call formatter');
    t.end();
});

test('putout: cli: process-file: parser error: eslint', async (t) => {
    const eslint = stub().returns(['', [{
        rule: 'eslint/null',
        message: 'Parsing error: Unexpected token ?',
        position: {line: 331, column: 34},
    }]]);
    
    const source = 'var x = 5';
    const fix = true;
    const log = stub();
    const ruler = {};
    const write = stub();
    const fileCache = {
        canUseCache: stub().returns(false),
        removeEntry: stub(),
        setInfo: stub(),
        getPlaces: stub().returns([]),
    };
    
    mockRequire('./eslint', eslint);
    
    const processFile = reRequire('./process-file');
    const fn = processFile({
        fix,
        log,
        ruler,
        write,
        fileCache,
    });
    
    await fn({
        name: 'example.js',
        source,
        index: 0,
        length: 1,
    });
    
    stopAll();
    
    t.notOk(fileCache.setInfo.called, 'should not call fileCache.setInfo');
    t.end();
});

test('putout: cli: process-file: parser error: eslint: report', async (t) => {
    const eslint = stub().returns(['', [{
        rule: 'eslint/null',
        message: 'Parsing error: Unexpected token ?',
        position: {line: 331, column: 34},
    }]]);
    
    const source = 'var x = 5';
    const fix = true;
    const log = stub();
    const ruler = {};
    const write = stub();
    const fileCache = {
        canUseCache: stub().returns(false),
        removeEntry: stub(),
        setInfo: stub(),
        getPlaces: stub().returns([]),
    };
    
    mockRequire('./eslint', eslint);
    
    const processFile = reRequire('./process-file');
    const fn = processFile({
        fix,
        log,
        ruler,
        write,
        fileCache,
    });
    
    await fn({
        name: 'example.js',
        source,
        index: 0,
        length: 1,
    });
    
    stopAll();
    
    const [arg] = write.args;
    const [first] = arg;
    
    t.ok(first.includes('Parsing error'));
    t.end();
});

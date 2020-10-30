'use strict';

const {readFileSync} = require('fs');
const {join} = require('path');

const test = require('supertape');
const remark = require('remark');

const putout = require('..');

const file = readFileSync(join(__dirname, 'fixture', 'js.md'), 'utf8');

test('remark-putout', (t) => {
    remark()
        .use(putout, {
            rules: {
                'strict-mode': 'off',
            },
        })
        .process(file, (err, file) => {
            const message = '"a" is defined but never used';
            
            t.deepEqual(file.messages[0].message, message);
            t.end();
        });
});


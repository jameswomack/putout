'use strict';

const {
    run,
    predefined
} = require('madrun');

const {eslint} = predefined;

module.exports = {
    'test': () => `tape 'test/*.js'`,
    'watch:test': () => `nodemon -w lib -w test -x ${run('test')}`,
    'lint': () => eslint({
        ignore: ['test/fixture'],
        names: [
            'lib',
            'test',
        ],
    }),
    'fix:lint': () => run('lint', '--fix'),
    'putout': () => `putout lib test`,
    'coverage': () => `nyc ${run('test')}`,
    'report': () => `nyc report --reporter=text-lcov | coveralls || true`,
};


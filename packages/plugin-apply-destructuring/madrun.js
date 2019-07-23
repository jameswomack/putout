'use strict';

const {
    run
} = require('madrun');

module.exports = {
    'test': () => `tape 'lib/**/*.spec.js' 'test/*.js'`,
    'watch:test': () => `nodemon -w lib -w test -x ${run('test')}`,
    'lint': () => `eslint lib test --ignore-pattern 'fixture'`,
    'fix:lint': () => run('lint', '--fix'),
    'putout': () => `putout lib test`,
    'coverage': () => `nyc ${run('test')}`,
    'report': () => `nyc report --reporter=text-lcov | coveralls || true`
};


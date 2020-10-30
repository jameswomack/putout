'use strict';

const {readFile} = require('fs').promises;
const {
    parseError,
    parseName,
} = require('./parse-error');

module.exports = async (e, {debug, formatterOptions, report, currentFormat, name, source, places, index, count}) => {
    const parsed = parseName(e);
    const {loc} = e || {};
    const isDebug = parsed && !loc && debug;
    
    source = isDebug ? await readFile(parsed, 'utf8') : source;
    name = isDebug ? parsed : name;
    
    return report(currentFormat, {
        formatterOptions,
        name,
        places,
        index,
        count,
        source,
    });
}


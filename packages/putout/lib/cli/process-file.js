'use strict';

const {dirname} = require('path');
const {readFile} = require('fs').promises;

const tryCatch = require('try-catch');
const memo = require('nano-memoize');

const putout = require('../..');

const eslint = require('./eslint');
const {
    parseError,
    parseName,
} = require('./parse-error');

const {ignores} = putout;

module.exports = ({write, fix, debug, transform, fileCache, fixCount, rulesdir, format, isFlow, isJSX, ruler, logError, raw, exit, noConfig, plugins = []}) => async ({name, source, rawSource, index, length, startLine, options}) => {
    const {
        dir,
    } = options;
    
    if (fileCache.canUseCache({fix, options, name})) {
        const places = fileCache.getPlaces(name);
        
        return {
            places,
            code: source,
        };
    }
    
    if (ignores(dir, name, options))
        return {
            places: [],
            code: source,
        };
    
    const isTS = /\.tsx?$/.test(name);
    const [e, result] = tryCatch(putout, source, {
        fix,
        fixCount,
        isTS,
        isFlow,
        isJSX,
        ...options,
    });
    
    if (e) {
        raw && logError(e);
    }
    
    const {code = source} = result || {};
    const allPlaces = result ? result.places : parseError(e, {
        debug,
    });
    
    if (ruler.disable || ruler.enable || ruler.disableAll || ruler.enableAll)
        return {
            places: formatPlaces(startLine, allPlaces),
            code,
        };
    
    const [newCode, newPlaces] = await eslint({
        name,
        code,
        fix,
    });
    
    allPlaces.push(...newPlaces);
    
    const formatedPlaces = formatPlaces(startLine, allPlaces);
    
    return {
        places: formatedPlaces,
        code: newCode,
    };
};

function formatPlaces(line, places) {
    const newPlaces = [];
    
    for (const place of places) {
        const {position} = place;
        
        console.log(line, position.line);
        newPlaces.push({
            ...place,
            position: {
                ...position,
                line: line + position.line,
            }
        });
    }
    
    return newPlaces;
}


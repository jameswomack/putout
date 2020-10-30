'use strict';

const parseSep = require('./parse-sep');
const {keys, assign} = Object;

module.exports = (name, match) => {
    if (!match || !name)
        return {};
    
    let rules = {};
    const items = keys(match);
    
    for (const item of items) {
        const pattern = parseSep(item);
        
        if (RegExp(pattern).test(name)) {
            const current = match[item];
            if (current === 'off') {
                rules = null;
                continue;
            }
            
            assign(rules, match[item]);
        }
    }
    
    return {
        rules,
    };
};


'use strict';

const {extname} = require('path');

//const jsProcessor = require('./process-js');
const mdProcessor = require('./process-markdown');

module.exports.runProcessors = async ({name, process, rawSource, index, length}) => {
    const ext = extname(name).slice(1);
    const processors = [
        jsProcessor(),
        mdProcessor,
    ];
    
    let processedSource = '';
    let isProcessed = false;
    const allPlaces = [];
    
    for (const {extensions, preProcess, postProcess} of processors) {
        if (!extensions.includes(ext))
            continue;
        
        const list = preProcess(rawSource);
        const preProcessedList = [];
        
        for (const {source, startLine} of list) {
            const {code, places} = await process({
                name,
                source,
                rawSource,
                index,
                length,
                startLine,
            });
            
            preProcessedList.push(code);
            allPlaces.push(...places);
        }
        
        processedSource = postProcess(rawSource, preProcessedList);
        isProcessed = true;
    }
    
    return {
        places: allPlaces,
        processedSource,
        isProcessed,
    };
};

function jsProcessor() {
    return {
        extensions: require('putout/extensions'),
        preProcess: (source) => {
            return [{
                source,
                startLine: 0,
            }]
        },
        postProcess: (source) => {
            return source;
        }
    }
}


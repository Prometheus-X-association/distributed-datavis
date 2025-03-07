const d3 = require('d3');
const d3hexbin = require('d3-hexbin').hexbin;
d3.hexbin = d3hexbin;
global.d3 = d3;
global.d3.hexbin = d3hexbin;
const ddv = require('../../dist/ptx-ddv');

// Jest Dependencies - Configuration JSDOM
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

function isDictionary(obj) {
    return typeof obj === 'object' && obj !== null && obj.constructor === Object;
}

function main(){
    const plotType = 'hexagon';
    const json = {data:{nodes:[],edges:[]}};

    const invalidProps = {
        fontSize: '20px',
        fontFamily: ['Arial'],
        containerTag: ['div'],
        width: '500px',
        height: '500px',
        backgroundColor: ['#F0F0F0'],
        margin: [1],
        
        // SvgComponent

        // SvgVisualization
        disableSaveButtons: 'TrueA',
        enableAutoResize: 'TrueA',
        enableZoom: 'TrueA',
        valueField: ['Abc'],
        initialZoom: '1.5px',
        parentHtmlTag: ['Abc'],
        colors: [1,2,3],
        colorScale: ['Linear'],
        actionOnClick: ['Abc'],
        hideLegend: 'TrueA',

        // WordMap
        enableZoom: 0,
        hideNumber: 0,
        figSize: '40px',
        showZoomButtons: 0,
        mouseOver: [],
        defaultCamera: 'TrueA',
        showActionButtons: 'TrueA',

        // Hexagon
        strokeWidth: '3px',
        strokeColor: ['#0F0F0F'],
        spaceBetweenFigures: '14px',
        nameField: ['name']
    };

    // Properties that are modified dinamically by other processes
    const exceptions = [
        'defaultCamera',
    ];

    const defaultProps = ddv.visualizers.wordmap.HexagonMap.getDefaultProperties();
    const plot = ddv.visualizers.wordmap.buildWordMap(json, plotType, {});

    plot.setProperties(invalidProps);

    var currentProps = plot.properties.getProperties();

    var propNames = Object.keys(currentProps);
    for (let i = 0; i < propNames.length; i++) {
        const propName = propNames[i];
        if (exceptions.includes(propName)) continue;
        const defaultValue = defaultProps[propName];
        const currentValue = currentProps[propName];

        if (Array.isArray(defaultValue) || isDictionary(defaultValue)){
            test(`Property ${propName} must have default value`, ()=>{expect(currentValue).toEqual(defaultValue)});
        } else {
            test(`Property ${propName} must have default value`, ()=>{expect(currentValue).toBe(defaultValue)});
        }
    }

    const correctProps = {
        fontSize: 21,
        fontFamily: 'Arial',
        containerTag: 'div',
        width: 1111,
        height: 1112,
        backgroundColor: '#FAF0FA',
        
        // SvgComponent

        // SvgVisualization
        disableSaveButtons: true,
        enableAutoResize: true,
        enableZoom: false,
        valueField: 'Abc',
        initialZoom: 1.1,
        parentHtmlTag: 'div',
        colors: ['#F0F00A'],
        colorScale: 'pow',
        actionOnClick: 'remove',
        hideLegend: true,

        // WordMap
        hideNumber: true,
        figSize: 44,
        showZoomButtons: true,
        mouseOver: false,
        showActionButtons: false,

        // Hexagon
        strokeWidth: 3,
        strokeColor: '#AFAFAF',
        spaceBetweenFigures: 22,
        nameField: 'label',
    }

    plot.setProperties(correctProps);

    currentProps = plot.properties.getProperties();

    propNames = Object.keys(correctProps);
    for (let i = 0; i < propNames.length; i++) {
        const propName = propNames[i];
        if (exceptions.includes(propName)) continue;
        const expectedValue = correctProps[propName];
        const currentValue = currentProps[propName];

        if (Array.isArray(expectedValue) || isDictionary(expectedValue)){
            test(`Property ${propName} must have modified value`, ()=>{expect(currentValue).toEqual(expectedValue)});
        } else {
            test(`Property ${propName} must have modified value`, ()=>{expect(currentValue).toBe(expectedValue)});
        }
    }
}

describe('HexagonMap Properties Tests', ()=>{
    main();
});
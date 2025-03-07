const save = require("../../../save");
const LegendUtils = require("../../legends/Legend.utils");
const TooltipUtils = require("../../tooltip/Tooltip.utils");
const { showNodeDetails } = require("./details.node");
const { highlightOnClick } = require("./highlight.neighborhood");
const { recenterOnClick } = require("./recenter.node");
const { showNodeRelations } = require("./relations.node");
const { removeOnClick } = require("./remove.node");
const { sourceOnClick } = require("./sources.node");
const { showValuesOnClick } = require("./values.node");

const MAIN_MENU_BUTTONS = [
    'showDownloadMenuButton','searchButton',
    'removeButton', 'highlightButton', 'recenterButton', 'sourceButton', 
    'showDetailsButton','selectGroupsButton','showRelationsButton','showValuesButton',
];

const DOWNLOAD_MENU_BUTTONS = ['downloadPngButton','hideDownloadMenuButton','downloadSvgButton'];


function removeDictFromList(list, key, value){
    const indexToRemove = list.findIndex((d)=> d[key] == value);
    list.splice(indexToRemove,1);
}

function getButtonDetails(plot){
    var details = [];

    var detailsMainButtons = [
        {
            tag: 'search',
            id: 'searchButton',
            char: '🔍',
            hover: 'Search a concept',
            action: ()=>{showOrHideSearchBox(plot)},
        },{
            tag: 'remove',
            id:'removeButton',
            char: '🗑️',
            hover: 'Remove clicked elements from the MindMap temporally',
            action: ()=>{interaction.changeOnClickAction(plot,'remove');_highlightActionButton(plot);},
        },{
            tag: 'recenter',
            id:'recenterButton',
            char: '🎯',
            hover: 'Recenter the concepts around the selected one',
            action: ()=>{interaction.changeOnClickAction(plot,'recenter');_highlightActionButton(plot);},
        },{
            tag: 'highlight',
            id: 'highlightButton',
            char: '💡',
            hover: 'Highlights the concepts that are related to the selected concept',
            action: ()=>{interaction.changeOnClickAction(plot,'highlight');_highlightActionButton(plot);},
        },{
            tag:'source',
            id: 'sourceButton',
            char: '🕵️',
            hover: 'See the links to the sources of the selected concept',
            action: ()=>{interaction.changeOnClickAction(plot,'source');_highlightActionButton(plot);},
        },{
            tag:'showdetails',
            id: 'showDetailsButton',
            char: '📝',
            hover: 'Shows the attributes of the clicked concept',
            action: ()=>{interaction.changeOnClickAction(plot,'showdetails');_highlightActionButton(plot);},
        },{
            tag:'selectgroups',
            id: 'selectGroupsButton',
            char: '🗂️',
            hover: 'Choose which groups do you want to visualizer',
            action: ()=>{
                if (plot._legends.length == 0) return;
                hideButtons(plot,MAIN_MENU_BUTTONS,0);
                showButtons(plot,['exitSelectGroupsButton'],500);
                LegendUtils.showButtonsLegend(plot);
            },
        },{
            tag: 'downloadMenu',
            id: 'showDownloadMenuButton',
            char: '💾',
            hover: 'Show Download Options',
            action: ()=>{showDownloadMenu(plot)},
        },{
            tag: 'showrelations',
            id: 'showRelationsButton',
            char: '🔌',
            hover: 'Shows the list of relations of the clicked concept',
            action: ()=>{interaction.changeOnClickAction(plot,'showrelations');_highlightActionButton(plot);},
        },{
            tag: 'showvalues',
            id: 'showValuesButton',
            char: '📈',
            hover: 'Show the values associated with the clicked concept',
            action: ()=>{interaction.changeOnClickAction(plot,'showvalues');_highlightActionButton(plot);}
        }
    ];

    const {sourceField,timeSeriesField} = plot.getProperties();
    const sourcesFirstElement = plot.getData()?.at(0)[sourceField];
    const valuesFirstElement = plot.getData()?.at(0)[timeSeriesField];
    const hasOneCategory = (Object.keys(plot._legends).length < 2) || (Object.keys(plot._groupToColorIndex).length < 2);
    const hasSources = Array.isArray(sourcesFirstElement);
    const hasTimeSeries = Array.isArray(valuesFirstElement);
    const hasRelations = plot.digitalTwin.nodesHaveRelations == true;
    const saveLibIsLoaded = typeof(saveSvg) == 'function';

    if (hasOneCategory) removeDictFromList(detailsMainButtons, 'id','selectGroupsButton');
    if (!hasSources) removeDictFromList(detailsMainButtons, 'id','sourceButton');
    if (!saveLibIsLoaded) removeDictFromList(detailsMainButtons, 'id','showDownloadMenuButton');
    if (!hasTimeSeries) removeDictFromList(detailsMainButtons, 'id','showValuesButton');
    if (!hasRelations) removeDictFromList(detailsMainButtons, 'id','showRelationsButton');

    var y = 1;
    for (let i = 0; i < detailsMainButtons.length; i++) {
        const element = detailsMainButtons[i];
        element.x = 1;
        element.y = y;
        y+=1;
    }

    var details = [
        {
            tag: 'exitselectgroups',
            id: 'exitSelectGroupsButton',
            char: '🔙',
            hover: 'Back',
            background: 'none',
            x: 1, y: 1,
            action: ()=>{
                LegendUtils.hideButtonsLegend(plot);
                const groups = LegendUtils.getSelectedGroups(plot);
                console.log({groups});
                plot.setProperties({'filterGroups':groups});
                plot.graphToMap.setProperties({'filterGroups':groups});
                exitLegendSelection(plot);
            },
        },{
            tag: 'hideDownloadMenu',
            id: 'hideDownloadMenuButton',
            char: '🔙',
            hover: 'Back',
            background: 'none',
            x: 1, y: 1,
            action: ()=>{hideDownloadMenu(plot)},
        },{
            tag: 'downloadPng',
            id: 'downloadPngButton',
            char: 'PNG',
            color: 'white',
            width: 80,
            hover: 'Download MindMap as PNG',
            x: 1, y: 2,
            action: ()=>{save.exportPng(plot)},
        },{
            tag: 'downloadSvg',
            id: 'downloadSvgButton',
            char: 'SVG',
            color: 'white',
            width: 80,
            hover: 'Download MindMap as SVG',
            x: 1, y: 3,
            action: ()=>{save.exportSvg(plot)},
        }
    ];

    // Disable Save Buttons
    const {disableSaveButtons} = plot.getProperties();
    if (disableSaveButtons === true){
        removeDictFromList(details,'key','showDownloadMenuButton');
    }

    details = [...detailsMainButtons , ...details];

    return details;
}

function changeOnClickAction(plot, action){
    if (typeof(action) != 'string') return;
    if (action.length == 0) return;
    action = action.toLowerCase();

    const This = plot;
    
    const onClick = (event) => recenterOnClick(event, This);

    switch (action) {
        case 'showdetails':
            var actionOnClick = showNodeDetails;
            TooltipUtils.enableTooltip(plot, true);
            plot.tooltip.properties.margin = {top:10,bottom:10,left:10,right:10};
            break;
        case 'remove':
            var actionOnClick = removeOnClick;
            break;
        case 'showvalues':
            var actionOnClick = showValuesOnClick;
            break;
        case 'recenter':
            var actionOnClick = recenterOnClick;
            break;
        case 'highlight':
            var actionOnClick = highlightOnClick;
            break;
        case 'source':
            var actionOnClick = sourceOnClick;
            _initializeSourceTooltip(plot);
            break;
        case 'showrelations':
            var actionOnClick = showNodeRelations;
            TooltipUtils.enableTooltip(plot, true);
            plot.tooltip.properties.margin = {top:10,bottom:10,left:10,right:10};
            break;
        default:
            var actionOnClick = onClick;
            break;
    }

    plot.properties.initializeProperty('actionOnClick', action);
    // Add reference to plot in the execution of the event
    plot._actionOnClickFunction = (event) => actionOnClick(event,This);
}

function _initializeButton(plot, buttonInfo){
    if (buttonInfo == null) return;

    const {
        id, x, y, char, hover, action, color, width, background,
    } = buttonInfo;

    const { margin } = plot.properties;

    if (typeof(id) != 'string' || id.length == 0) return;
    if (typeof(x) != 'number' || x <= 0) return;
    if (typeof(y) != 'number' || y <= 0) return;

    const svg = plot.getComponents().outerSVG;

    var buttonWidth = 35;
    var buttonHeight = 35;

    const xPadding = 10;
    const yPadding = 10;
    const plotHeight = plot.properties.height;
    const FONT_SIZE_BUTTON = '23px';

    if (typeof(background) == 'string'){
        var buttonColor = background;
    } else {
        var buttonColor = "#08233b";
    }

    if (typeof(width) == "number"){
        var buttonWidth = width;
    }

    const xButton = xPadding + (x-1)*(buttonWidth + xPadding) ;
    const yButton = plotHeight - y*(buttonHeight + yPadding);

    const button = svg.selectAll('svg#' + id).data([null]).enter()
    .append('svg').attr('id',id)
    .attr('x', xButton).attr('y',yButton)
    .attr('height',buttonHeight).attr('width',buttonWidth)
    .style('cursor','pointer')
    .attr('class','actionButton');

    if (button.node() == null) return button;

    const buttonRect = button.append('rect').attr('height','100%').attr('width','100%')
    .attr('rx','10').attr('ry','10').attr('fill', buttonColor);

    const foreign = button.append('foreignObject').attr('x',0).attr('y',3)
    .attr('width','100%').attr('height','100%').node();

    var buttonText = document.createElement('text');
    foreign.appendChild(buttonText);

    buttonText = d3.select(buttonText)
    .style('text-align','center')
    .style('display','block')
    .style('font-size',FONT_SIZE_BUTTON)
    .text(char);

    if (typeof(hover) == 'string'){
    buttonText.attr('title',hover);
    }

    if (typeof(color) == 'string'){
        buttonText.style('color',color);
    }

    button.on('click', action);

    return button;
}

function getButtonsSvg(plot){
    const svg = plot.getComponents().outerSVG;

    const buttons = {};

    const svgIds = [
        'removeButton', 'highlightButton', 'recenterButton', 
        'sourceButton', 'searchButton', 'showDetailsButton',
        'showRelationsButton','showValuesButton',
        'showDownloadMenuButton','downloadPngButton',
        'hideDownloadMenuButton','downloadSvgButton',
        'downloadJsonButton','selectGroupsButton',
        'exitSelectGroupsButton'
    ];

    svgIds.forEach((id)=>{
    const svgButton = svg.select(`svg#${id}`);
    buttons[id] = svgButton;
    });

    const foreignIds = ['searchBox'];

    foreignIds.forEach((id)=>{
    const svgButton = svg.select(`foreignObject#${id}`);
    buttons[id] = svgButton;
    });

    return buttons;
}

function initializeButtons(plot){
    const svg = plot.getComponents().outerSVG;
    if (svg.node() == null) return;

    const buttonDetails = getButtonDetails(plot);
    
    // Initialize Buttons
    buttonDetails.forEach((buttonInfo)=>{
        _initializeButton(plot, buttonInfo);
    });

    _initSearchBox(plot);
    _highlightActionButton(plot);

    hideButtons(plot, DOWNLOAD_MENU_BUTTONS, 0);
    hideButtons(plot, ['exitSelectGroupsButton'],0);
}

function showDownloadMenu(plot){
    hideButtons(plot, MAIN_MENU_BUTTONS,0);
    hideSearchBox(plot);
    showButtons(plot, DOWNLOAD_MENU_BUTTONS, 500);
}

function hideDownloadMenu(plot, duration){
    if (typeof(duration) != "number") duration = 500;
    hideButtons(plot,DOWNLOAD_MENU_BUTTONS,duration);
    hideSearchBox(plot);
    showButtons(plot, MAIN_MENU_BUTTONS, duration);
}

function exitLegendSelection(plot, duration){
    if (typeof(duration) != "number") duration = 500;
    hideButtons(plot,['exitSelectGroupsButton'],0);
    showButtons(plot, MAIN_MENU_BUTTONS, duration);
}

function showOrHideSearchBox(plot){
    const {searchBox} = getButtonsSvg(plot);
    if (searchBox.style('display') != 'unset'){
    searchBox.transition().duration(500).style('display','unset');
    } else {
    // Hide
    hideSearchBox(plot);
    }
}

function showButtons(plot, buttons, duration){
    if (!Array.isArray(buttons)) return;
    const svgs = getButtonsSvg(plot);

    buttons.forEach( (buttonName) => {
    const button = svgs[buttonName];
    button.select('rect')
    button.transition().duration(duration).style('opacity',1).style('display','unset');  
    });
}

function hideButtons(plot, buttons, duration){
    if (!Array.isArray(buttons)) return;
    const svgs = getButtonsSvg(plot);

    buttons.forEach( (buttonName) => {
    const button = svgs[buttonName];
    button.transition().duration(duration).style('opacity',0).transition().style('display','none');
    });
}

function hideSearchBox(plot){
    const {searchBox} = getButtonsSvg(plot);
    searchBox.style('display','none');
    plot._highlightAllNodes();
    plot.properties.mouseOver = true;
}

function _initSearchBox(plot){
    const outerSVG = plot.getComponents().outerSVG;

    const buttonSize = 35;
    const xPadding = 10;
    const yPadding = 10;
    const height = plot.properties.height;
    const yBox = height - buttonSize - yPadding;
    const xBox = xPadding + 1 * (buttonSize + xPadding);


    const foreignObject = outerSVG.selectAll('foreignObject#searchBox')
    .data([null]).enter()
    .append('foreignObject')
    .attr('id','searchBox')
    .attr('height', buttonSize)
    .attr('width',100)
    .attr('x',xBox)
    .attr('y',yBox);
    
    const input = foreignObject.append('xhtml:input')
    .attr('type','text')
    .style('width','100%')
    .style('height','100%')
    .style('font-size',16);

    input.on('keyup', function(event){
    if (event.key == 'Escape'){
        hideSearchBox(plot);
    }
    })

    input.on('keypress',function(event){
        if (event.key != 'Enter') return;
        const searchText = this.value;
        _highlightSearch(plot,searchText);
    });

    foreignObject.style('display','none');
}

function _highlightSearch(plot,search){
    var search = search.trim();

    if (typeof(search) != "string" || search.length == 0){
        plot._highlightAllNodes();
        plot.properties.mouseOver = true;
        return;
    }

    var search = search.replaceAll(' ','_');
    var search = search.toLowerCase();
    const nodes = plot.getData();
    const filteredNodes = [];
    nodes.forEach( d=>{
        const label = d.label;
        const id = d.id;
        if (label.includes(search)){
            filteredNodes.push(id);
        }
    });
    
    if (filteredNodes.length == 0){
        plot._highlightAllNodes();
        plot.properties.mouseOver = true;
        return;
    }

    plot.properties.mouseOver = false;
    plot._unHighlightAllNodes();
    plot._highlightListOfNodes(filteredNodes);
}

function _highlightActionButton(plot){
    var defaultButtonColor = "#08233b";

    const buttons = getButtonsSvg(plot);
    const buttonsDetails = getButtonDetails(plot);
    const action = plot.properties.actionOnClick;

    const validActions = ['remove','highlight','recenter','source','showdetails','showrelations','showvalues'];
    if (!validActions.includes(action)) return;

    const highlightColor = '#ffffff';

    validActions.forEach( (actionName)=>{
        const buttonInfo = buttonsDetails.find((a)=> a.tag === actionName);
        if (buttonInfo == undefined) return;

        const buttonId = buttonInfo.id;
        if (buttonInfo == null || buttonId == null) return;
        
        const button = buttons[buttonId];
        if (typeof(buttonInfo.background) == 'string'){
            var buttonColor = buttonInfo.background;
        } else {
            var buttonColor = defaultButtonColor;
        }
        button.select('rect').attr('fill', buttonColor);
    });

    const buttonId = buttonsDetails.find((a)=> a.tag === action)?.id;
    if (buttonId == null) return;

    const button = buttons[buttonId];
    button.select('rect').style('stroke','black').style('stroke-width',2)
    .attr('fill',highlightColor);
}

function _initializeSourceTooltip(plot){
    TooltipUtils.enableTooltip(plot, true);
    const tooltip = plot.tooltip;
    tooltip.setSize(300,50);
    tooltip.properties.margin = {'left':10, 'top':10, 'bottom':10, 'right':10};
    tooltip.properties.backgroundColor = '#c0c0c0';
}

const interaction = {
    changeOnClickAction,
    initializeButtons,
    getButtonsSvg,
}

module.exports = interaction;
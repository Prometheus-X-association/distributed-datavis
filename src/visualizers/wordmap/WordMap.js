const interaction = require("./interaction");
const SvgVisualization = require("../svg/SvgVisualization");
const VisualUtils = require("../visual.utils");
const ButtonsUtils = require("../svg/buttons.utils");

/**
 * @abstract class
 */
class WordMap extends SvgVisualization {
    static defaultProperties = {
        enableZoom: true,
        hideNumber: true,
        figSize: 50,
        showZoomButtons: false,
        mouseOver: true,
        defaultCamera: true,
        showActionButtons: true,

        nameField: 'label',
        categoryField: 'group',
        sourceField: 'sources',
        valueFieldToShow: 'value',
        timeSeriesField: 'values',
        centerCameraAround: null,
        centerNode: null,
        strokeWidth: 3,
        strokeColor: '#000000',
    }

    static rulesProperties = {
        hideNumber: {type:'boolean'},
        figSize: {type:'number'},
        showZoomButtons: {type:'boolean'},
        mouseOver: {type:'boolean'},
        defaultCamera: {type:'boolean'},
        showActionButtons: {type:'boolean'},

        nameField: {type:'string'},
        categoryField: {type:'string'},
        sourceField: {type:'string'},
        valueFieldToShow: {type:'string'},
        timeSeriesField: {type:'string'},
        strokeWidth: {type:'number'},
        strokeColor: {type:'string'},
    }

    // Initialize Attributes
    digitalTwin = null;
    graphToMap = null;

    defineSetters(){
        super.defineSetters();
        this.afterSetters.showActionButtons = (v)=>this.showActionButtons.call(this,v);
        this.customSetters.centerNode = (v)=>this.setCenterNode.call(this,v);
        //this.customSetters.colors = (v)=>this.setColors.call(this,v);
        this.customSetters.actionOnClick = (action) => interaction.changeOnClickAction(this, action);
    }

    constructor(mapType, plotId, props) {
        super(plotId, props);
        
        if (this.constructor == WordMap) {
            throw new Error("WordMap is an Abstract class, can't be instantiated.");
        }

        this.mapType = mapType;
        this._obtainTooltipData = null;
        this._groupToColorIndex = {};
    }

    /******************** Action Buttons ********************/
    // This function is called automatically when you modify the parameter showActionButtons in Properties object
    showActionButtons(enable){
        if (this.components == null) return;

        const { outerSVG } = this.getComponents();
        if (enable === true){
            interaction.initializeButtons(this);
            outerSVG.selectAll('.actionButton').datum((d)=>d).style('display','unset');
        } else {
            outerSVG.selectAll('.actionButton').datum((d)=>d).style('display','none');
        }
        return true;
    }
    /*********************************************************/

    setProperties(props) {
        if (props == null) return;
        if (typeof (props) !== "object") return details;

        const { initialZoom } = props;
        if (typeof (initialZoom) == 'number' && initialZoom > 0) {
            props.defaultCamera = false;
        }

        super.setProperties(props);

        var requiresDataRefresh = false;

        if (typeof (props.valueFieldToShow) == "string") {
            this.valueFieldToShow = props.valueFieldToShow;
            props.hideNumber = false;
        }

        //this._initColorIndices();
        
        if (props.hasOwnProperty('colors')) this._initColorIndices();

        if (this.digitalTwin != null) {
            const { reprocess, changes } = this.digitalTwin.setProperties(props);
            if (reprocess === true) requiresDataRefresh = true;
        }

        if (this.graphToMap != null) {
            const graphChanges = this.graphToMap.setProperties(props)?.changes;
            if (graphChanges?.centerNode != null) requiresDataRefresh = true;
        }

        // TODO: Add AfterSetter
        interaction.changeOnClickAction(this, this.properties.actionOnClick);

        if (requiresDataRefresh === true) {
            console.log('REFRESHING DATA');
            this.refreshData();
            return;
        } else {
            // Insert any extra operation
        }
    }

    /**
     * Receives a list of Numeric identifiers for the existing groups in the given data, and
     * assigns one color to each
     * @param {*} groups 
     */
    #initColorIndicesAux(groups) {
        if (!Array.isArray(groups)) return;
        const { colors } = this.properties;
        const groupsInt = [];
        // Sometimes, when JSON is loaded, some groups are parsed by javascript as Strings, for that reason it's
        // necessary to convert them always
        groups.forEach(d => groupsInt.push(Number.parseInt(d)));
        const sortedGroups = groupsInt.sort(function (a, b) { return a - b });
        for (var i = 0; i < sortedGroups.length; i++) {
            const group = sortedGroups[i];
            this._groupToColorIndex[group] = i;
            // If index is greater than existing colors, Generates new Random color
            if (i >= colors.length) {
                var color = Math.floor(Math.random() * 16777216).toString(16);
                var color = '#000000'.slice(0, - color.length) + color;
                colors.push(color);
            }
        }
    }

    _initColorIndices() {
        if (this.graphToMap == null) return;
        this._groupToColorIndex = {};
        const { categoryField } = this.getProperties();
        const groups = [];
        this.graphToMap.getLocatedNodes().forEach(function (d) {
            const group = d[categoryField];
            if (!groups.includes(group)) groups.push(group)
        });
        this.#initColorIndicesAux(groups);
    }

    getColor(group) {
        const { colors } = this.properties;
        const groupAlreadyRegistered = this._groupToColorIndex.hasOwnProperty(group);
        const index = Object.keys(this._groupToColorIndex).length;
        const needsMoreColors = index > colors.length;
        if (needsMoreColors || !groupAlreadyRegistered) {
            // Generate Random color
            var color = Math.floor(Math.random() * 16777216).toString(16);
            var color = '#000000'.slice(0, - color.length) + color;
            colors.push(color);
        } if (!groupAlreadyRegistered) {
            this._groupToColorIndex[group] = index;
        }
        const colorIndex = this._groupToColorIndex[group];
        return colors[colorIndex];
    }

    setColors(colors){
        this.properties.initializeProperty('colors',colors);
    }

    setCenterNode(centerLabel) {
        if (typeof (centerLabel) !== 'string') return;
        this.properties.initializeProperty('centerNode', null);
        if (this.digitalTwin == null) return;

        const centerInfo = this.digitalTwin.getNodeInfoByLabel(centerLabel);
        if (centerInfo == null){
            this.properties.initializeProperty('centerNode', null);
            this.properties.initializeProperty('centerNodeId', null);
            return;
        }
        const centerId = centerInfo['id'];
        this.properties.initializeProperty('centerNode', centerLabel);
        this.properties.initializeProperty('centerNodeId', centerId);
    }

    // This function is used to perform validations before executing plot()
    _validateParameters() {
        var {
            centerNodeId, centerNodeLabel
        } = this.getProperties();

        if (centerNodeId == null && centerNodeLabel != null) {
            this.setCenterNode(centerNodeLabel);
        }
    }

    setGraphToMap(graphToMap) {
        if (graphToMap == null) return;

        this.graphToMap = graphToMap;
        this.digitalTwin = graphToMap.digitalTwin;

        // Refresh Parameters
        this.setCenterNode(this.properties.centerLabel);

        this._initColorIndices();
    }

    modifyCentralNode(nodeId) {
        if (this.graphToMap == null) {
            console.log("WordMap doesn't have a well defined graphToMap processor");
            return;
        }
        this.properties.centerNodeId = nodeId;
        this.graphToMap.locateNodesAround(nodeId);
        const newNodes = this.graphToMap.getLocatedNodes();
        this.draw(newNodes);
    }

    _showTooltipInfo(nodeId) {
        const {
            enableTooltip
        } = this.getProperties();
        
        if (enableTooltip === false) return;

        var nodeInfo = this.digitalTwin.getNodeInfoById(nodeId);
        var nodeSVG = this.getComponents().container.select(`svg.concept[nodeId="${nodeId}"]`).datum((d)=>d);
        if (!nodeInfo.hasOwnProperty('tooltipInfo')) return;

        const tooltip = this.tooltip;

        var explains = nodeInfo.tooltipInfo;

        tooltip.restartSVG();
        explains.forEach(e => {
            tooltip.addLink(e.url, e.title)
            tooltip.addLine('\n');
        });

        const x = Number(nodeSVG.attr('x')) - (tooltip.properties.width - Number(nodeSVG.attr('width'))) / 2;
        const y = Number(nodeSVG.attr('y')) - (tooltip.properties.height) + 15;
        tooltip.move(x, y);

        this.tooltip.show();
    }

    //@override
    getStorableComponent() {
        if (this.graphToMap != null) {
            var recenteredNodes = this.graphToMap.getLocatedNodes();
            this.plot(recenteredNodes);
        } else {
            this.refresh();
        }

        const { container } = this.getComponents();
        const svgToPlot = container;
        return svgToPlot;
    }

    _highlightAllNodes() {
        const { innerSVG } = this.getComponents();
        const allNodes = innerSVG.selectAll('svg.concept').datum((d)=>d);
        allNodes.style('opacity', '1').style('font-weight', 'normal');
        allNodes.selectAll('line').datum((d)=>d).style('opacity', '1');
    }

    _unHighlightAllNodes() {
        const { innerSVG } = this.getComponents();

        const allNodes = innerSVG.selectAll('svg.concept').datum((d)=>d);
        allNodes.style('opacity', '0.3').style('font-weight', 'normal');
        allNodes.selectAll('line').datum((d)=>d).style('opacity', '0.3');
    }

    _highlightListOfNodes(nodes) {
        if (!Array.isArray(nodes)) return;

        const { innerSVG } = this.getComponents();
        const { 
            centerNodeId, categoryField
        } = this.getProperties();
        const This = this;

        const allNodes = this.digitalTwin.getData().nodes;
        var maxValue = allNodes[0].value;
        var maxValue = this._scaleValue(maxValue);

        const isIncluded = (d)=>{
            var id = d?.id;
            id = parseInt(id);
            return nodes.includes(id);
        }

        const concepts = innerSVG.selectAll('svg.concept')
        .datum((d)=>d)
        .filter(isIncluded);
        concepts.style('opacity', '1');
        
        concepts.selectAll('line')
        .style('opacity', '1');

        // IF IS NOT CENTER NODE
        
        concepts.each(function (nodeInfo){
            var nodeId = nodeInfo?.id;
            if (nodeInfo == null){
                nodeId = this.getAttribute('nodeId');
                nodeInfo = plot.digitalTwin.getNodeInfoById(nodeId);
            }
            nodeId = parseInt(nodeId);
            if (!nodes.includes(nodeId)) return;

            const path = d3.select(this).datum(nodeInfo).select('path').datum((d)=>d);

            path.attr('fill', ()=>{
                var value = This._scaleValue(nodeInfo['value']);
                var percentBrightness = VisualUtils.scaleBrightness(value, maxValue);
                var percentBrightness = Math.max(percentBrightness, 0);
                var color = This.getColor(nodeInfo[categoryField]),
                color = VisualUtils.increaseBrightness(color, percentBrightness);
                return color;
            });
        });
    }

    _highlightNode(nodeId) {
        if (nodeId == null) return;
        if (this.graphToMap == null) return;
        const nodeInfo = this.digitalTwin.getNodeInfoById(nodeId);
        const neighbors = this.digitalTwin.getNeighborsById(nodeId);
        const { innerSVG } = this.getComponents();

        const allNodes = innerSVG.selectAll('svg.concept').datum(d=>d);
        allNodes.style('opacity', '0.3').style('font-weight', 'normal');
        allNodes.selectAll('line').datum(d=>d).style('opacity', '0.3');

        const mainNode = innerSVG.select(`svg.concept[nodeId="${nodeId}"]`).datum(nodeInfo);
        mainNode.style('font-weight', 'bold');
        const nodes = [nodeId].concat(neighbors);
        this._highlightListOfNodes(nodes);
    }

    refreshData() {
        this.graphToMap.locateNodes();
        const newPlotData = this.graphToMap.getLocatedNodes();
        this.setData(newPlotData);
        this.refresh();
    }

    removeListOfElementsByName(listOfElements) {
        if (!Array.isArray(listOfElements)) return;
        if (listOfElements.length == 0) return; // Prevents executing unnecesary operations

        this.digitalTwin.removeListOfElementsByName(listOfElements);
        this.refreshData();
    }

    removeElementById(elementId) {
        this.digitalTwin.removeElementById(elementId);
        this.graphToMap.locateNodes();
        const newPlotData = this.graphToMap.getLocatedNodes();
        this.setData(newPlotData);
        this.refresh();
    }

    translateVisualization(x, y, scale) {
        const zoom = d3.zoom();
        const transform = `translate(${x},${y}) scale(${scale})`;

        const { container , innerSVG } = this.components;

        container.attr('transform', transform);
        
        if (innerSVG?.style('display') !== 'inline') return;

        innerSVG.call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale))
    }

    addZoomButtons() {
        const increaseFactor = 0.2;
        const zoomButtonSize = 30;
        const separation = 5;
        const zoomInButtonInfo = {
            id: 'zoomIn',
            x: separation + (1 * zoomButtonSize),
            y: 0,
            width: zoomButtonSize,
            height: zoomButtonSize,
            label: '➕',
            backgroundColor: 'white',
        }

        const zoomIn = () => {
            var {x,y,scale} = this.getCurrentPosition();
            const {width,height} = this.getProperties();
            const newScale = scale + increaseFactor;
            // This transformation needs to be refined -> It's imperfect
            x = x - width*0.5*(1+increaseFactor);
            y = y - height*0.5*(1+increaseFactor);
            this.translateVisualization(x, y, newScale);
        }

        ButtonsUtils.addButton(this,zoomInButtonInfo, zoomIn);

        // Zoom Out

        const buttonInfo = {
            id: 'zoomOut',
            x: 0,
            y: 0,
            width: zoomButtonSize,
            height: zoomButtonSize,
            label: '➖',
            backgroundColor: 'white',
        }

        const zoomOut = () => {
            var {x,y,scale} = this.getCurrentPosition();
            const {width,height} = this.getProperties();
            const newScale = scale - increaseFactor;
            // This transformation needs to be refined -> It's imperfect
            x = x + width*0.5*(1+increaseFactor);
            y = y + height*0.5*(1+increaseFactor);
            this.translateVisualization(x, y, newScale);
        }

        ButtonsUtils.addButton(this,buttonInfo, zoomOut);
    }
}

module.exports = WordMap;
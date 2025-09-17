const ObjectWithProperties = require("../../properties/ObjectWithProperties");
const SkillsUtils = require("../skills.utils");
const { getDefaultColors } = require("./colors");
const DigitalTwinProcessing = require("./DigitalTwinProcessing");
const shrink = require("./shrink");

class DigitalTwin extends ObjectWithProperties {
/**

nodes
edges
ids

neighbors { id : Array }

isNeighbor(a,b)
getNeighbors(a)
getNodeInfoById(id)
getNodeInfoByLabel(label)


*/
    static defaultProperties = {
        onlyCompounds: false,
        filterMinWeight : 0,
        filterMinValue : 0,
        filterGroups : [],
        maxNodes: null,
        valueField: 'value',
        hideNodes: [],
        subgraph: null,
        extraColorMaping: {},
        newGroups: [],
        colors: [],
    }

    static rulesProperties = {
        onlyCompounds: {type:'boolean'},
        filterMinWeight: {type:'number'},
        filterMinValue: {type:'number'},
        filterGroups: {type:'array', subtype:'number'},
        maxNodes: {type:'number'},
        valueField: {type:'string'},
        hideNodes: {type:'array', subtype:'string'},
        subgraph: {type:'string'},
        extraColorMaping: {type:'dictionary', subtype:'string'},
        newGroups: {type:'array', subtype:'number'},
        colors: {type:'array', subtype:'string'},
    }

    defineSetters(){
        super.defineSetters();
        this.customSetters.subgraph = (v)=>this.setSubgraph.call(this,v);
    }

    constructor(json, props){
        super(props);
        const originalData = JSON.parse(JSON.stringify(json));
        this._processSources(originalData);
        this.originalData = originalData;

        this._nodes = [];
        this._edges = [];
        this._neighbors = {};
        this._idToIndex = {};
        this._labelToIndex = {};

        const { valueField, colorNodes, colorNeighbors } = this.properties;

        const { nodes , edges, sources } = this.getOriginalData();
        const sortedNodes = DigitalTwinProcessing.sortArrayOfObjects(nodes,valueField);
        const sortedEdges = DigitalTwinProcessing.sortArrayOfObjects(edges,valueField);
        this.#modifyOriginalData({
            nodes: sortedNodes,
            edges: sortedEdges,
        });

        this._nodes = nodes;
        this._processNodes(nodes);
        this._colorNodes(colorNodes);
        this._colorNeighbors(colorNeighbors);

        this._processData();

        this.nodesHaveRelations = DigitalTwinProcessing.doNodesHaveRelations(sortedNodes);
    }

    setProperties(props){
        var { reprocess , changes } = super.setProperties(props);

        const refreshFields = [
            'filterMinWeight','filterMinValue','filterGroups','onlyCompounds','hideNodes','maxNodes',
        ];

        for (let i = 0; i < refreshFields.length; i++) {
            const field = refreshFields[i];
            if (changes[field] != null){
                reprocess = true;
                break;
            }
        }

        if (reprocess === true) this._processData();

        return { reprocess , changes };
    }

    getData(){
        return {
            nodes: this._nodes,
            edges: this._edges,
            neighbors: this._neighbors,
            idToIndex: this._idToIndex,
            labelToIndex: this._labelToIndex,
        }
    }

    getOriginalData(){
        const original = this.originalData;

        if (original == null) return null;
        
        if (original.hasOwnProperty('data')){
            var data = original.data;
        } else {
            var data = original;
        }
        
        const title = original.title;
        const { 
            nodes , edges , sources , legends ,
            indicators ,
        } = data;
        const uniqueIdentifier = data.unique_identifier;

        return {
            title, sources,
            nodes, edges, legends, uniqueIdentifier, indicators,
        };
    }

    #modifyOriginalData(data){
        const {nodes,edges} = data;

        var data = this.originalData;
        if (data.hasOwnProperty(data)) data = data.data;

        if (Array.isArray(nodes)){
            data.nodes = nodes;
        }

        if (Array.isArray(edges)){
            data.edges = edges;
        }
    }

    getNeighborsById(id){
        const {neighbors} = this.getData();
        const neighborList = neighbors[id];
        if (neighborList == null) return [];
        return neighborList;
    }

    getSources(id){
        const node = this.getNodeInfoById(id);
        if (node == null) return [];
        const { sources } = node;
        const expandedSources = [];
        for (let i = 0; i < sources.length; i++) {
            const sourceId = sources[i];
            const source = this._sources[sourceId];
            if (source == null) continue;
            expandedSources.push(source);
        }
        return expandedSources;
    }

    getNeighborsByLabel(label){
        const node = this.getNodeInfoByLabel(label);
        const id = node.id;
        const neighbors = this.getNeighborsById(id);
        return neighbors;
    }

    getNodeInfoById(id){
        const index = this._idToIndex[id];
        const {nodes} = this.getData();
        const node = nodes[index];
        return node;
    }

    getNodeInfoByLabel(label){
        const index = this._labelToIndex[label];
        const {nodes} = this.getData();
        const node = nodes[index];
        return node;
    }

    hasId(id){
        const { idToIndex } = this.getData();
        const has = idToIndex.hasOwnProperty(id);
        return has;
    }

    hasLabel(label){
        const { labelToIndex } = this.getData();
        const has = labelToIndex.hasOwnProperty(label);
        return has;
    }

    removeElementById(id){
        const label = this.getNodeInfoById(id).label;
        this.properties.hideNodes.push(label);
        this._processData();
    }

    removeListOfElementsByName(listOfElements){
        if (!Array.isArray(listOfElements)) return;
        
        listOfElements.forEach((label)=>{
            const { hideNodes } = this.getProperties();
            if (hideNodes.includes(label)) return;
            if (!this.hasLabel(label)) return;
            hideNodes.push(label);
        });
        this._processData();
    }

    // Get Maximum group
    getMaxGroup(){
        const originalData = this.getOriginalData();
        if (originalData == null) return;
        var {nodes} = originalData;
        if (nodes.length == 0) return;
        var maxGroup = Number.parseFloat(nodes[0]['group'])

        for (let i = 0; i < nodes.length; i++) {
            var group = nodes[i]['group'];
            group = Number.parseFloat(group);
            if (group > maxGroup) maxGroup = group;
        }
        return maxGroup;
    }

    // Clasifies certain nodes in the map under a new group
    _colorNeighbors(coloringRule){
        if (typeof(coloringRule) != 'string') return;
        const pieces = coloringRule.split(',');
        if (pieces.length == 0) return;

        var currentColor = null;
        var currentGroup = this.getMaxGroup();
        var colors = null
        if (this.properties.colors.length >= currentGroup){
            colors = this.properties.colors;
        } else {
            colors = getDefaultColors(currentGroup);
        }
        
        for (let i = 1; i <= currentGroup; i++) {
            this.properties.extraColorMaping[i] = colors[i-1];
        }

        const defaultColor = getDefaultColors(1)[0];

        for (let i = 0; i < pieces.length; i++) {
            var piece = pieces[i].trim();
            if (piece == '#000000') piece = defaultColor;
            if (piece.startsWith('#')){
                currentGroup += 1;
                currentColor = piece;
                this.properties.extraColorMaping[currentGroup] = currentColor;
                this.properties.newGroups.push(currentGroup);
                continue;
            }
            
            const label = SkillsUtils.normalizeSkill(piece);
            const node = this.getNodeInfoByLabel(label);
            if (node == null) continue;

            const nodeId = node['id'];
            const edges = this.getOriginalData().edges;
            for (let i = 0; i < edges.length; i++) {
                const edge = edges[i];
                if (edge['from'] == nodeId){
                    var neighbor = this.getNodeInfoById(edge['to']);
                    if (neighbor == null) continue;
                    neighbor['group'] = currentGroup;
                    
                } else if (edge['to'] == nodeId){
                    var neighbor = this.getNodeInfoById(edge['from']);
                    if (neighbor == null) continue;
                    neighbor['group'] = currentGroup;
                }
            }
        }
    }

    // Clasifies certain nodes in the map under a new group
    _colorNodes(coloringRule){
        if (typeof(coloringRule) != 'string') return;
        const pieces = coloringRule.split(',');
        if (pieces.length == 0) return;

        var currentColor = null;
        var currentGroup = this.getMaxGroup();

        const colors = getDefaultColors(currentGroup);
        for (let i = 1; i <= currentGroup; i++) {
            this.properties.extraColorMaping[i] = colors[i-1];
        }

        const defaultColor = getDefaultColors(1)[0];

        for (let i = 0; i < pieces.length; i++) {
            var piece = pieces[i].trim();
            if (piece == '#000000') piece = defaultColor;
            if (piece.startsWith('#')){
                currentGroup += 1;
                currentColor = piece;
                this.properties.extraColorMaping[currentGroup] = currentColor;
                this.properties.newGroups.push(currentGroup);
                continue;
            }
            
            const label = SkillsUtils.normalizeSkill(piece);
            const node = this.getNodeInfoByLabel(label);
            if (node == null) continue;
            node['group'] = currentGroup;
        }
    }

    _processNodes(nodes){
        this._idToIndex = {};
        this._labelToIndex = {};

        // IdToIndex and LabelToIndex
        for (let i = 0; i < nodes.length; i++) {
            const id = nodes[i].id;
            const label = nodes[i].label;
            this._idToIndex[id] = i;
            
            if (this.hasLabel(label)) continue;
            this._labelToIndex[label] = i;
        }
    }

    _processSources(originalData){
        const sources = originalData?.data?.sources || originalData?.sources;
        this._sources = {};
        const allSources = this._sources;

        // If has latest source format skip computation
        if (Array.isArray(sources)){
            for (let i = 0; i < sources.length; i++) {
                const sourceId = sources[i]['id'];
                allSources[sourceId] = sources[i];
            }
            return;
        }

        const nodes = originalData?.data?.nodes || originalData?.nodes || [];

        const sourceContentToId = {};
        var nextSourceId = 0;

        for (let i = 0; i < nodes.length; i++) {
            const { sources } = nodes[i];
            if (typeof(sources) === 'number') continue;
            if (!Array.isArray(sources)){  // Data validation
                nodes[i].sources = [];
                continue;
            }

            for (let j = 0; j < sources.length; j++) {
                const source = sources[j];
                
                const sourceContent = source.title.trim() + source.url.trim();
                var sourceId = sourceContentToId[sourceContent];

                // If source has not been registered before, add it to the register and increment sourceId by 1
                if (sourceId === undefined){
                    sourceId = nextSourceId;
                    sourceContentToId[sourceContent] = nextSourceId;
                    source.id = sourceId; // Add id to source content
                    nextSourceId += 1;
                    allSources[sourceId] = source;
                }

                sources[j] = sourceId; // Replaces the source inside the node for its id
            }
        }
    }

    _processData(){
        this._neighbors = {};
        this._idToIndex = {};
        this._idToIndex = {};
        this._labelToIndex = {};

        const originalData = this.getOriginalData();
        if (originalData == null) return;

        /**/
        var {nodes,edges} = originalData;
        const { maxNodes , subgraph, colorNodes } = this.getProperties();

        const subgraphId = nodes.find((d)=>d.label == subgraph)?.id;
        const subgraphIsActive = (subgraphId != null);

        var {nodes,edges} = this.#filterData();

        const willCalculateFilters = typeof(maxNodes) == 'number' && Array.isArray(nodes) && nodes.length > 0;

        if (willCalculateFilters){
            const filteredNodes = nodes;
            const {minWeight, minValue, count} = shrink.findOptimalFilters(filteredNodes, maxNodes, this.getProperties());
            if (count != null) console.log(`Map Shrink: Nodes:'${count}', MinWeight:'${minWeight}', MinValue:'${minValue}'`);
            this.properties.filterMinWeight = minWeight;
            this.properties.filterMinValue = minValue;
            var {nodes,edges} = this.#filterData();
        }

        this._nodes = nodes;
        this._edges = edges;

        this.#processNeighbors();
        
        this._processNodes(nodes);

        // Neighbors List
        const neighbors = this._neighbors;
        edges.forEach((edge)=>{
            const {from,to} = edge;
            if (neighbors[from] == null){
                neighbors[from] = new Set();
            }
            if (neighbors[to] == null){
                neighbors[to] = new Set();
            }

            neighbors[from].add(to);
            neighbors[to].add(from);
        });

        // Convert Sets to Lists
        Object.keys(neighbors).forEach((id)=>{
            neighbors[id] = Array.from(neighbors[id]);
        });
    }

    belongsToActiveGroup(nodeGroups, filterGroups){
        if (!Array.isArray(nodeGroups)) return filterGroups.has(nodeGroups);

        for (let i = 0; i < nodeGroups.length; i++) {
            const group = nodeGroups[i];
            const belongs = filterGroups.has(group);
            if (belongs) return true;
        }

        return false;
    }

    #filterData(){
        const {
            filterMinValue , filterMinWeight , filterGroups, onlyCompounds, hideNodes, subgraph
        } = this.getProperties();

        var { nodes , edges } = this.getOriginalData();

        const valueFilterIsActive = (filterMinValue > 0);
        const weightFilterIsActive = (filterMinWeight > 0);
        const groupFilterIsActive = (filterGroups.length > 0);
        const hideNodesIsActive = (hideNodes.length > 0);
        const subgraphId = nodes.find((d)=>d.label == subgraph)?.id;
        const subgraphIsActive = (subgraphId != null);
        const subgraphIds = this.#getRelatedIds(subgraphId, edges);
        subgraphIds.push(subgraphId);

        const filteredNodes = [];
        const filteredEdges = [];
        const filteredIds = new Set();

        const filteredData = {
            nodes: filteredNodes,
            edges: filteredEdges,
            ids: filteredIds,
        };
    
        const groups = new Set(filterGroups);
    
        // Filter nodes
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            DigitalTwinProcessing.normalizeNodeInfo(node);
            const {group,id,value,label,weight} = node;
    
            //if (groupFilterIsActive && !groups.has(group)) continue;
            if (groupFilterIsActive && !this.belongsToActiveGroup(group, groups)) continue;
            if (valueFilterIsActive && value < filterMinValue) continue;
            if (weightFilterIsActive && weight < filterMinWeight) continue;
            if (onlyCompounds && !DigitalTwinProcessing.isCompound(label)) continue;
            if (hideNodesIsActive && hideNodes.includes(label)) continue;
            if (subgraphIsActive && !subgraphIds.includes(id)) continue; // Id belongs to the subgraph filter

            // Filter if subgraph is active
            
            filteredNodes.push(node);
            filteredIds.add(id)
        }

        // Filter edges based on final nodes
        for (let i = 0; i < edges.length; i++) {
            const edge = edges[i];
            if (!filteredIds.has(edge.to) || !filteredIds.has(edge.from)) continue;
            filteredEdges.push(edge);
        }

        return filteredData;
    }

    #getRelatedIds(id, edges){
        var ids = new Set();
        for (let i = 0; i < edges.length; i++) {
            const edge = edges[i];
            const from = edge['from'];
            const to = edge['to'];
            if (from == id) ids.add(to);
            if (to == id) ids.add(from);
        }
        ids = Array.from(ids);
        return ids;
    }

    #processNeighbors(){
        const { edges , idToIndex } = this.getData();

        for (let i = 0; i < edges.length; i++) {
            const {from,to} = edges[i];
            if (idToIndex[from] == null) idToIndex[from] = new Set();
            if (idToIndex[to] == null) idToIndex[to] = new Set();

            idToIndex[from].add(to);
            idToIndex[to].add(from);
        }
    }

    setSubgraph(subgraph){
        subgraph = SkillsUtils.normalizeSkill(subgraph);
        this.properties.initializeProperty('subgraph',subgraph);
    }
}

module.exports = DigitalTwin;
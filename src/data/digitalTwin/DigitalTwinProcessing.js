function reduceMap(json, idsToPreserve){
    json = normalizeMindMapJson(json);
    const nodes = json.nodes;
    const edges = json.edges;

    var i = 0;
    var length = nodes.length;
    while (i < length){
        const node = nodes[i];
        const id = node.id;
        if (!idsToPreserve.includes(id)){
            nodes.splice(i,1);
            length--;
        } else {
            i++;
        }
    }

    var i = 0;
    var length = edges.length;
    while (i < length){
        const edge = edges[i];
        const from = edge.from;
        const to = edge.to;
        if (!idsToPreserve.includes(from) || !idsToPreserve.includes(to)){
            edges.splice(i,1);
            length--;
        } else {
            i++;
        }
    }
}

function normalizeMindMapJson(json){
    const normalized = {
        ...json.data,
        info: json.info,
    }

    if (json.hasOwnProperty('data')) json = json.data;
    normalized.nodes = json.nodes || [];
    normalized.edges = json.edges || [];
    normalized.legends = json.legends || [];

    return normalized;
}

function normalizeStatisticsJson(json){
    var data = []

    if (json.constructor == Array){
        data = json
    } else if (json.hasOwnProperty('data')) {
        data = json.data
    } else if (json.hasOwnProperty('skills')) {
        data = json.skills
    }

    return { 'data':data }
}

function hasTimeSeries(json,timeSeriesField){
    var json = normalizeMindMapJson(json);
    const { nodes } = json;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const value = node[timeSeriesField];
        if (Array.isArray(value) && value.length > 0) return true;
    }
    return false;
}

function isMapSeries(json){
    if (json == null) return false;
    if (!json.hasOwnProperty("data")) return false;

    try {
        const firstElement = json['data'][0];
        if (!firstElement.hasOwnProperty('buttonTitle')) return false;
        if (!firstElement.hasOwnProperty('title')) return false;
        return true;
    } catch (error) {
        return false;
    }

    return false;
}


function plotTypeIsCompatibleWithData(plotType, json){
    const dataFormat = detectDataType(json);
    const compatibility = {
      'digitalTwin': ['hexagon','square','barchart'],
      'statistics': ['linechart','top20','barchartgroup'],
    }
  
    if (!compatibility.hasOwnProperty(dataFormat)) return false;
  
    const compatibleTypes = compatibility[dataFormat];
  
    const isCompatible = (compatibleTypes.includes(plotType));
    return isCompatible;
  }
  
  /**
   * 
   * @param {*} json 
   * @returns [digitalTwin, statistics, signals]
   */
  function detectDataType(json){
      var dataType = null;
  
      if (json == null || typeof(json) != 'object') return dataType;
  
      if (json.hasOwnProperty('data')){
          json = json.data;
      }
  
      if (mapHasTimeSeries(json)) return 'signals';

      if (json.hasOwnProperty('nodes')){
        return 'digitalTwin';
      } 
  
      if (Array.isArray(json) && json.length > 0){
        const firstElement = json[0];
        if (firstElement.hasOwnProperty('demand')) return 'statistics';
        if (firstElement.hasOwnProperty('buttonTitle')) return 'mapseries';
      }
  
      return dataType;
}

function getCenterNode(nodes){
    const centerField = "search_center";
    var centerNode = null;

    if (!Array.isArray(nodes)) return centerNode;

    for (var i=0; i < nodes.length; i++){
        const node = nodes[i];
        if (!node.hasOwnProperty(centerField)) continue;
        if (node[centerField] == "true"){
            return node;
        }
    }
    return centerNode;
}


function jsonSupportsRelevancyMode(json){
    const data = normalizeMindMapJson(json);
    try {
      const firstNode = data.nodes[0]
      if (!firstNode.hasOwnProperty('weight')){
        return false;   
      }
    } catch (error) {
      return false;
    }
    return true;
}

function removeLabelsFromMindMap(json, labelsToRemove){
    const {nodes, edges} = normalizeMindMapJson(json);
    if (!Array.isArray(labelsToRemove)) return {nodes,edges};
    if (!Array.isArray(nodes)) return {nodes,edges};
    if (!Array.isArray(edges)) return {nodes,edges};
    const idsToRemove = [];
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const label = node.label;
        const id = node.id;
        if (labelsToRemove.includes(label)) idsToRemove.push(id);
    }
    removeIdsFromMindMap(json, idsToRemove);
}

function removeIdsFromMindMap(json, idsToRemove){
    const {nodes, edges} = normalizeMindMapJson(json);
    if (!Array.isArray(idsToRemove)) return {nodes,edges};
    if (!Array.isArray(nodes)) return {nodes,edges};
    if (!Array.isArray(edges)) return {nodes,edges};

    const newNodes = [];
    const newEdges = [];

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const id = node.id;
        if (idsToRemove.includes(id)) continue;
        newNodes.push(node);
    }

    for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const from = edge.from;
        const to = edge.to;
        if (idsToRemove.includes(from)) continue;
        if (idsToRemove.includes(to)) continue;
        newEdges.push(edge);
    }

    if (json.data && json.data.nodes) json.data.nodes = newNodes;
    if (json.nodes) json.nodes = newNodes;

    if (json.data && json.data.edges) json.data.edges = newEdges;
    if (json.edges) json.edges = newEdges;
}

function nodesToStatistics(nodes){
    if (!Array.isArray(nodes)) return null;

    const data = [];

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const newNode = {};

        newNode['concept'] = node['label']
        newNode['displayname'] = formatLabel(node['label'])
        newNode['value'] = node['value']
        newNode['id'] = node['id']

        data.push(newNode);
        
    }


    return {data:data};
}

function formatLabel(label){
    if (typeof(label) !== 'string') return null;
    label = label.split('_').join(' ')
    label = label.split('-').join(' ')
    return label
}

function doNodesHaveRelations(nodes){
    if (!Array.isArray(nodes)) return;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const relations = node['relations'];
        if (Array.isArray(relations) && relations.length > 0) return true;
    }
    return false;
}

function isCompound(label){
    if (typeof(label) !== 'string') return false;
    label = label.trim();
    const words = label.split(/[\s_]+/);
    return (words.length > 1);
}

function sortArrayOfObjects(array, field){
    if (array.length === 0) return array;
    var sorted = array.sort((a,b) =>  b[field]-a[field]);
    return sorted
}

function normalizeNodeInfo(node){
    if (typeof(node.group) == 'string') node.group = Number.parseInt(node.group);
}

const DigitalTwinProcessing = {
    normalizeMindMapJson,
    normalizeStatisticsJson,
    reduceMap,
    getCenterNode,
    
    // JSON Verification
    hasTimeSeries,
    isMapSeries,
    jsonSupportsRelevancyMode,
    detectDataType,
    plotTypeIsCompatibleWithData,
    doNodesHaveRelations,

    // Remove Skills
    removeIdsFromMindMap,
    removeLabelsFromMindMap,

    nodesToStatistics,

    // Other functions
    isCompound,
    sortArrayOfObjects,
    normalizeNodeInfo,
}

module.exports = DigitalTwinProcessing;
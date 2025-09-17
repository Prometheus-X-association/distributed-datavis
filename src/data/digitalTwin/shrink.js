function filterAndCount(nodes, minValue, minWeight){
    var count = 0;
    nodes.forEach((node) => {
        if (node.value < minValue) return;
        const weight = Number.parseInt(node.weight);
        if (weight < minWeight) return;
        count++;
    });
    return count;
}

function findOptimalMinValue(nodes, desiredSize, minWeight){
    const filteredNodes = [];
    
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node['weight'] >= minWeight) filteredNodes.push(node);
    }

    const nFilteredNodes = filteredNodes.length;

    if (nFilteredNodes <= desiredSize) return 0;

    const lastNode = filteredNodes[nFilteredNodes - desiredSize];
    const minValue = lastNode['value']
    return minValue;
}

function findOptimalFilter(nodes, desiredSize, minWeight){
    var minValue = findOptimalMinValue(nodes, desiredSize, minWeight);
    const totalOption1 = filterAndCount(nodes, minValue, minWeight);
    const totalOption2 = filterAndCount(nodes, minValue + 1, minWeight);

    const dif1 = Math.abs(totalOption1 - desiredSize);
    const dif2 = Math.abs(totalOption2 - desiredSize);

    if (dif2 < dif1){
        var minValue = minValue + 1;
        var total = totalOption2;
        var dif = dif2;
    } else {
        var total = totalOption1;
        var dif = dif1;
    }

    const optimal = {'minValue':minValue, 'count': total, 'difference': dif};

    return optimal;
}

function sortNodes(nodes){
    const valueField = 'value';
    const sorted = [...nodes].sort((a,b) => a[valueField] - b[valueField]);
    return sorted;
}

function findOptimalFilters(nodes, desiredSize, filters){
    if (typeof(desiredSize) !== 'number') return {};
    if (!Array.isArray(nodes) || nodes.length == 0) return {};
    if (desiredSize <= 0 ) return  {'minWeight':null, 'minValue':null, 'count':null};

    if (desiredSize >= nodes.length) return {'minWeight':null, 'minValue':null, 'count':null}

    // Ascending Sorting
    const reorganizedNodes = sortNodes(nodes);

    // Check if nodes have weights
    if (nodes[0].weight == null){
        console.log('Warning at findOptimalFilters() - Make sure that the given map contains weights, otherwise, automatic reduction won\'t work.');
        return {};
    }

    var {
        filterMinWeight,
        filterMinValue
    } = filters;

    if (![1,2,3,4,5].includes(filterMinWeight)) filterMinWeight = 1;
    var minWeights = [];
    for (let i = filterMinWeight; i <= 5; i++) {
        minWeights.push(i);
    }

    var selectedMinValue = null;
    var selectedMinWeight = null;
    var selectedDifference = null;
    var selectedCount = null;

    for (var i=0; i < minWeights.length; i++){
        const minWeight = minWeights[i];
        const {minValue, count, difference} = findOptimalFilter(reorganizedNodes, desiredSize, minWeight);
        //console.log(`weight:${minWeight} value:${minValue} count:${count} difference:${difference}`);
        if (selectedMinValue == null || difference < selectedDifference){
            selectedMinValue = minValue;
            selectedMinWeight = minWeight;
            selectedDifference = difference;
            selectedCount = count;
        }
    }

    return {
        'minWeight':selectedMinWeight,
        'minValue': selectedMinValue,
        'count': selectedCount,
    }
}

const shrink =  {
    findOptimalFilters,
}

module.exports = shrink;
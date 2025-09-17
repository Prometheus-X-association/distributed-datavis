const { TooltipVisualizer } = require("../../tooltip/TooltipVisualizer");
const { getNodeIdFromEvent } = require("./utils");

function showValuesOnClick(event,plot){
    if (plot.graphToMap == null) return;
    if (plot.tooltipSubPlot == null) return;
    var nodeId = getNodeIdFromEvent(event);
    var nodeInfo = plot.graphToMap.digitalTwin.getNodeInfoById(nodeId);
    const valuesField = 'values';
    const {nameField} = plot.getProperties();

    if (!nodeInfo.hasOwnProperty(valuesField)) return;

    const timeLabels = plot.digitalTwin?.originalData?.info?.timeLabels || [];
    const json = nodeInfo[valuesField];
    const title = nodeInfo[nameField];
    plot.tooltipSubPlot.draw(json, timeLabels);
    plot.tooltipSubPlot.setTitle(title);
    TooltipVisualizer._showTooltipChart(plot);
}

module.exports = {
    showValuesOnClick,
}
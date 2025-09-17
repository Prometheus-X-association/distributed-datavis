const { validateType, normalizePropertyValue } = require("../../properties/utils");

function getSelectedGroups(plot) {
    const { legendContainer } = plot.components;
    const legends = legendContainer.selectAll('g.legendSelectButton');
    const groups = [];
    legends.each((data, index, rects) => {
        const thisRect = d3.select(rects[index]).select('rect');
        const isActive = thisRect.attr('active') === 'true';
        var groupId = thisRect.attr('groupId');
        groupId = Number.parseInt(groupId);
        if (isActive && !isNaN(groupId)) groups.push(groupId);
    });

    return groups;
}

function hideButtonsLegend(plot) {
    const { legendContainer, innerSVG } = plot.components;
    legendContainer.selectAll('g.legendSelectButton')
        .style('display', 'none')
        .style('opacity', 0);

    innerSVG.select('rect.hideContent')
        .style('display', 'none')
        .style('opacity', 0);
}

function showButtonsLegend(plot) {
    const { legendContainer, innerSVG } = plot.components;
    legendContainer.selectAll('g.legendSelectButton')
        .style('display', 'unset')
        .style('opacity', 1);

    innerSVG.select('rect.hideContent')
        .style('display', 'unset')
        .style('opacity', 1);
}

function initButtonsLegend(plot) {
    const {
        width, fontSize, legends
    } = plot.getProperties();

    if (legends == null || Array.isArray(legends)) return;
    const groups = Object.keys(legends);

    const { innerSVG, legendContainer } = plot.components;
    var legendFontSize = fontSize + 2;

    const legendSquareSize = legendFontSize + 5;
    const spaceBetweenLegends = 2;

    innerSVG.selectAll('rect.hideContent').data([null]).enter()
        .append('rect').attr('class', 'hideContent')
        .style('width', '100%').style('height', '100%').attr('fill', '#A0A0A0AA');

    var legend = function (svg) {
        const g = svg
            .style('text-anchor', 'end')
            .selectAll('g.legendSelectButton')
            .data(groups)
            .join('g')
            .attr('class', 'legendSelectButton')
            .attr('transform', (d, i) => `translate(0,${i * (legendSquareSize + spaceBetweenLegends)})`);

        if (g.selectAll('rect').size() > 0) return;

        g.append('rect')
            .attr('x', -legendSquareSize)
            .attr('width', legendSquareSize)
            .attr('height', legendSquareSize)
            .attr('fill', function (d) { return plot.getColor(d) })
            .attr('active', true)
            .attr('groupId', d => d)
            .style('stroke-width', '1px')
            .style('stroke', 'black')
            .on('click', function (event, groupId) {
                const thisRect = d3.select(this);
                var isActive = thisRect.attr('active') === 'true';
                isActive = !isActive
                thisRect.attr('active', isActive);
                if (!isActive) {
                    thisRect.attr('fill', '#A0A0A0')
                        .style('stroke-width', '0px');
                } else {
                    thisRect.attr('fill', (d) => plot.getColor(d))
                        .style('stroke-width', '1px');
                }
            });
    }

    legendContainer.call(legend);
    hideButtonsLegend(plot);
}

/**
   * Creates a Legend for each group
   * @param legends A list of Strings that contains the label of each group
   */
function initLegend(plot) {
    const {
        width, fontFamily, fontSize, legends,
    } = plot.getProperties();
    const { outerSVG } = plot.components;

    if (outerSVG == null) return;

    if (legends == null || Array.isArray(legends)) return;
    const groups = Object.keys(legends);

    var legendFontSize = fontSize + 2;

    const legendSquareSize = legendFontSize + 5;
    const spaceBetweenLegends = 2;

    const legendContainer = outerSVG.selectAll('g.legend').data([null]).enter().append('g').attr('class', 'legend');

    plot.components.legendContainer = outerSVG.select('g.legend');

    if (plot.properties.hideLegend === true) {
        legendContainer.style('display', 'none');
    } else {
        legendContainer.style('display', 'unset');
    }

    const legendBackground = legendContainer.selectAll('g.legend-background')
        .data([null]).enter()
        .append('g')
        .attr('class', 'legend-background');

    const xLegend = width;

    var legend = function (svg) {
        const g = svg
            .attr('transform', `translate(${xLegend},0)`)
            .style('text-anchor', 'end')
            .selectAll('g.legendTitle')
            .data(groups)
            .join('g')
            .attr('class', 'legendTitle')
            .attr('transform', (d, i) => `translate(0,${i * (legendSquareSize + spaceBetweenLegends)})`);

        g.append('rect')
            .attr('x', -legendSquareSize)
            .attr('width', legendSquareSize)
            .attr('height', legendSquareSize)
            .attr('fill', function (d) { return plot.getColor(d) });

        g.append('text')
            .attr('x', -(legendSquareSize + 5))
            .style('font-size', legendFontSize + 'px')
            .style('font-family', fontFamily)
            .attr('y', 9.5)
            .attr('dy', '0.35em')
            .text(function (l) { return legends[l] })
            .attr('fill', 'black');
    }

    legendContainer.call(legend);

    // Calculate location of the background
    const textNodes = legendContainer.selectAll('text').nodes();
    var longestWidth = 0;
    for (var i = 0; i < textNodes.length; i++) {
        const node = textNodes[i];
        const nodeWidth = node.getBoundingClientRect().width;
        if (nodeWidth > longestWidth) longestWidth = nodeWidth;
    }

    const legendWidth = longestWidth + legendSquareSize + 20;
    const legendHeight = (legendSquareSize + spaceBetweenLegends) * groups.length;

    // Add background
    legendBackground
        .attr('transform', `translate(-${legendWidth},0)`)
        .append('rect')
        .attr('fill', '#e0e0e0e0')
        .attr('height', legendHeight)
        .attr('width', legendWidth);

    initButtonsLegend(plot);

}

function hideLegend(plot){
    const { outerSVG } = plot.components;
    const legendContainer = outerSVG.select('g.legend').datum(d=>d);
    legendContainer.style('display', 'none');
}

function showLegend(plot){
    const { outerSVG } = plot.components;
    const legendContainer = outerSVG.select('g.legend').datum(d=>d);
    legendContainer.style('display', 'unset');
}

function preprocessLegend(props, json){
    var { legends } = props;
    const nodes = json.nodes;
    const isDictionary = validateType('dictionary', legends);
    if (isDictionary) return;

    const newLegends = {};
    legends = normalizePropertyValue('array',legends);
    if (legends.length == 0) return;
    console.log({legends, g2m:this.graphToMap}, this);
    const groupIds = getGroups(nodes);
    for (let i = 0; i < groupIds.length; i++) {
        const key = groupIds[i];
        const value = legends.at(i) || '';
        newLegends[key] = value
    }
    
    json['legends'] = newLegends;
}

function getGroups(nodes, categoryField){
    categoryField = categoryField || 'group';
    var allGroups = [];

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        var groups = node[categoryField];
        if (!Array.isArray(groups)) groups = [groups];
        for (let j = 0; j < groups.length; j++) {
            const group = groups[j];
            if (!allGroups.includes(group)) allGroups.push(group)
        }
    }
    allGroups = allGroups.sort();
    return allGroups;
}

const LegendUtils = {
    initLegend,
    initButtonsLegend,
    hideButtonsLegend,
    showButtonsLegend,
    getSelectedGroups,
    hideLegend,
    showLegend,
    preprocessLegend,
    getGroups,
}

module.exports = LegendUtils;
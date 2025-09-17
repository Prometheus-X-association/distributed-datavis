const { getNodeIdFromEvent } = require("./utils");

function sourceOnClick(event,plot){
    var nodeId = getNodeIdFromEvent(event);
    const page = 1;
    showSourceData(plot,nodeId, page)
}

function showSourceData(plot, nodeId, page){
    const RESULTS_PER_PAGE = 5;

    const {
        sourceField,
    } = plot.getProperties();

    plot.tooltip.clean();
    plot.tooltip.setSize(300,50);
    const data = plot.digitalTwin.getNodeInfoById(nodeId);
    if (data.id != nodeId){ console.log('Warning at showSourceData() : Id is not consistant'); return;}
    if (!data.hasOwnProperty(sourceField)) return;
    const sources = plot.digitalTwin.getSources(nodeId);
    if (!Array.isArray(sources)) return;

    const startIndex = (page - 1) * RESULTS_PER_PAGE;
    const sourcesCurrentPage = sources.slice(startIndex, startIndex + RESULTS_PER_PAGE);

    for (let i = 0; i < sourcesCurrentPage.length; i++) {
        const source = sourcesCurrentPage[i];
        const url = source.url;
        const title = String(i+1+startIndex) + ") " +  source.title;
        plot.tooltip.addLink(url,title);
    }

    const tooltipText = plot.tooltip.getComponents().text;
    const buttonContainer = plot.tooltip._addOneLineInsideText(tooltipText,'');
    plot.tooltip._nLines = tooltipText.selectAll('tspan').size();
    plot.tooltip._checkResize();
    buttonContainer.attr('x','100%');
    buttonContainer.style('text-anchor','end');

    // Prev Page
    if (page > 1){
        const prevButtonText = "⬅️";
        const prevButton = buttonContainer.append('tspan').text(prevButtonText);
        prevButton.on('click', ()=>{showSourceData(plot, nodeId, page-1)}); 
        prevButton.style('cursor','pointer');
    }

    // Next Page
    const nSources = sources.length;
    var nPages = Math.floor(nSources/RESULTS_PER_PAGE)
    if (nSources % RESULTS_PER_PAGE > 0) nPages += 1;

    const pageIsLastPage = (page == nPages)
    if (pageIsLastPage == false){
        const nextButtonText = "➡️";
        const nextButton = buttonContainer.append('tspan').text(nextButtonText);
        nextButton.on('click', ()=>{showSourceData(plot, nodeId, page+1)});
        nextButton.style('cursor','pointer');
    }

    const node = d3.selectAll('svg.concept').filter(function(){
        var id = d3.select(this).attr('nodeId');
        return id == String(nodeId);
    });

    if (node.size == 0) return;
    const x = node.attr('x');
    const y = node.attr('y') - plot.tooltip.properties.height + 0;
    plot.tooltip.move(x,y);
    plot.tooltip.show();
}

module.exports = {
    sourceOnClick,
}
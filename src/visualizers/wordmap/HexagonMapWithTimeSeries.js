import colors from "../../data/digitalTwin/colors";
import { LineChart } from "../axis";
import Tooltip from "../tooltip/Tooltip";
import HexagonMap from "./HexagonMap";

export class HexagonMapWithTimeSeries extends HexagonMap {
    static defaultProperties = {
        actionOnClick: 'showvalues',
    }

    constructor(props) {
        const tooltipProps = props.tooltipProps || {};
        delete props.tooltipProps;
        super(props);
        this.setTooltipProperties(tooltipProps);
    }

    setTooltipProperties(props){
        this.tooltipProperties = props;
    }

    draw(data){
        if (this.hasSignals() == true){
            colors.configureMapWithSignals(this);
            this.properties.colorScale = 'flat';
        }

        const timeLabels = this.digitalTwin.originalData.info.timeLabels;
        super.draw(data, timeLabels);
        var tooltipProps = {timeLabels};
        this.setTooltipProperties(tooltipProps);
        this.enableLinechartTooltip();
    }

    hasSignals(){
        var has = (this.digitalTwin.originalData.legends[1] == 'Emerging') && (
            this.digitalTwin.originalData.legends[2] == 'Constantly Increasing'
        );
        return has;
    }

    enableLinechartTooltip() {
        const plotType = 'linechart';
        const { width, height } = this.properties;

        const props = this.tooltipProperties;

        if (plotType == null) return;
        if (typeof (plotType) !== "string") return;
        var { outerSVG } = this.getComponents();
        const tooltipId = '_tooltip_chart';
        const tooltipSVG = outerSVG.selectAll('svg#' + tooltipId).data([null]).enter()
            .append('svg')
            .attr('class', 'tooltipChart')
            .attr('id', tooltipId);

        const {
            padding = 20
        } = props;

        props.backgroundColor = '#00000000';
        props.margin = {top:20,bottom:20,left:20,right:20};

        const tooltip = new Tooltip(props);
        this.tooltipChart = tooltip;
        const tooltipWidth = width - (2 * padding);
        const tooltipHeight = height - (2 * padding);
        tooltip.setSize(tooltipWidth, tooltipHeight);
        tooltip.hide();

        const This = this;

        const funcAfterHide = () => {
            if (This.tooltipChart == null) return;
            const { innerSVG } = this.getComponents();
            innerSVG.style('opacity', 1)
        }

        const funcAfterShow = () => {
            if (This.tooltipChart == null) return;
            const { innerSVG } = this.getComponents();
            innerSVG.style('opacity', 0.2)
        }

        tooltip.executeFunctionAfterHide(funcAfterHide);
        tooltip.executeFunctionAfterShowing(funcAfterShow);

        // It's important to specify that the chart will be contained in a SVG, not in a DIV
        props['parentHtmlTag'] = 'svg';
        this.tooltipSubPlot = new LineChart(tooltipId, props);

        // Attach components
        const tooltipSvg = this.getComponents().outerSVG.select('svg.tooltipChart');
        this.tooltipChart.attachOnSelection(tooltipSvg);
        const tooltipInnerSvg = this.tooltipChart.components.innerSVG;
        this.tooltipSubPlot.attachOnSelection(tooltipInnerSvg);

        this.tooltipChart.components.background.style('display','none');
    }
}
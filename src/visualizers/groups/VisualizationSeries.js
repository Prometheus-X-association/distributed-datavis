const builder = require("../builder");
const Component = require("../Component");
const NavigationButtons = require("./NavigationButtons");

require('./VisualizationSeries.css');

const DEFAULT_RULES = { visuals : [] , properties : {} };

function validateRules(rules){
    if (rules == null) return false;
    if (!Array.isArray(rules?.visuals)) return false;
    // Else
    if (rules.properties == null) rules.properties = {};
    return true;
}

class VisualizationSeries extends Component {
    static defaultProperties = {
        width: 800,
        height: 600,
        titleHeight: 50,
        subtitleHeight: 30,
        titleMargin: 10,
        buttonMargin: 10,
        buttonSize: 40,
        showTitle: true,
        showButtons: true,
    };

    static rulesProperties = {

    };

    constructor(rules){
        if (!validateRules(rules)) rules = DEFAULT_RULES;
        const props = rules.properties;
        super(null,props);
        this.rules = rules;
        this._initButtons();
        this._initVisuals();
        const nVisuals = this.rules.visuals.length;
        if (nVisuals > 0) this.draw(0);
    }

    _calculateButtonProperties(){
        const { buttonsHeight } = this.calculateHeight();
        const { width , activeColor, inactiveColor } = this.properties;
        const props = {
            height: buttonsHeight,
            width: width,
            activeIndex: this.data,
            activeColor, inactiveColor,
        }
        return props;
    }

    _calculateVisualProperties(){
        const { buttonsHeight } = this.calculateHeight();
        const { width } = this.properties;
        const props = {
            height: buttonsHeight,
            width: width,
        }
        return props;
    }

    _initButtons(){
        const { navButtons } = this.components;
        const buttonTitles = this.rules.visuals.map((visualInfo)=>visualInfo?.buttonTitle);
        const buttonProps = this._calculateButtonProperties();
        buttonProps.onClick = (index)=>{this.draw(index)};
        this.navigationButtons = new NavigationButtons(buttonTitles, buttonProps);
        this.navigationButtons.attachOnSelection(navButtons);
        this.navigationButtons.refresh();
    }

    calculateHeight(){
        var { 
            buttonSize , buttonMargin , height , titleHeight, fontSize,
            showTitle, showButtons, titleMargin, subtitleFontSize , subtitleHeight ,
        } = this.properties;

        var buttonsHeight;
        var titleFontSize;
        var subtitleFontSize;

        const noSubtitle = this.getCurrentSubtitle() == null;
        if (noSubtitle) subtitleHeight = 0;

        if (showTitle == false){
            titleHeight = 0;
            subtitleHeight = 0;
            titleFontSize = 0;
            subtitleFontSize = 0;
        } else {
            titleFontSize = titleHeight - titleMargin*2 - 2; // -2 Reduces slightly the calculated size
            subtitleFontSize = subtitleHeight - titleMargin - 2; // -2 Reduces slightly the calculated size
        }

        if (showButtons == false){
            buttonsHeight = 0
        } else {
            buttonsHeight = buttonSize + buttonMargin*2 + fontSize;
        }
        
        var visualHeight = height - buttonsHeight - titleHeight - subtitleHeight;
        
        return { 
            buttonsHeight , visualHeight , titleHeight , titleFontSize ,
            subtitleHeight , subtitleFontSize ,
        };
    }

    _initVisuals(){
        const nVisuals = this.rules.visuals.length;
        this.visuals = [];

        for (let i = 0; i < nVisuals; i++) {
            this.visuals.push(null);
        }
    }

    getActiveVisualization(){
        const activeIndex = this.data;
        if (activeIndex == null) return null;
        const activeVisualization = this.visuals[activeIndex];
        return activeVisualization;
    }

    getActiveVisualInfo(){
        const activeIndex = this.data;
        if (activeIndex == null) return null;
        const visualInfo = this.rules.visuals[activeIndex];
        return visualInfo;
    }

    initComponents(){
        super.initComponents();
        const { mainContainer } = this.components;

        const title = mainContainer.append('div').classed('visualTitle',true);
        title.append('p').attr('class','visualMainTitle').text('').style('text-align','center');
        title.append('p').attr('class','visualSubTitle').text('').style('text-align','center');
        
        const activeVisual = mainContainer.append('div').classed('activeVisual',true);

        const navButtons = mainContainer.append('div').classed('navButtons',true);

        this.components.title = title;
        this.components.activeVisual = activeVisual;
        this.components.navButtons = navButtons;
    }

    getCurrentTitle(){
        return this.getActiveVisualInfo()?.title || null;
    }

    getCurrentSubtitle(){
        return this.getActiveVisualInfo()?.subtitle || null;
    }

    _refreshComponents(){
        super._refreshComponents();
        const { title , activeVisual , navButtons } = this.components;
        const { 
            buttonsHeight , visualHeight, 
            titleHeight , titleFontSize, 
            subtitleHeight, subtitleFontSize,
        } = this.calculateHeight();

        const { width , titleMargin } = this.properties;
        const visualTitle = this.getCurrentTitle() || '';
        const visualSubtitle = this.getCurrentSubtitle() || '';
        
        title.style('height', titleHeight + subtitleHeight)
            .select('p.visualMainTitle')
            .text(visualTitle)
            .style('font-size', titleFontSize)
            .style('margin',0);

        title.select('p.visualSubtitle')
            .text(visualSubtitle)
            .style('font-size', subtitleFontSize)
            .style('color','gray')
            .style('margin',0);
        
        activeVisual.style('height', visualHeight);
        navButtons.style('height', buttonsHeight).style('width', width);

        navButtons.select('svg.navButtons')
            .style('width',width)
            .style('height',buttonsHeight);

        const buttonProps = this._calculateButtonProperties();
        this.navigationButtons.setProperties(buttonProps);
        this.navigationButtons.refresh();
    }

    async draw(index){
        super.draw(null);
        this.getActiveVisualization()?.detach(); // Detach previous visualization if exists

        var visual;
        if (index === this.data){
            visual = this.getActiveVisualization();
        } else {
            // Fast Refresh over navigation buttons before building the next visualization
            this.navigationButtons.properties.activeIndex = index;
            this.navigationButtons.refresh();
            this.components.title.select('p').text('Loading...');
            visual = await this.buildVisualization(index);
        }
        
        if (visual === null) return;
        this.data = index;
        const visualDiv = this.components.activeVisual;
        visual.attachOnSelection(visualDiv);
        this.refreshVisualization(index);
        this._refreshComponents();
    }

    indexIsValid(index){
        if (typeof(index) !== 'number') return false;
        const nVisuals = this.rules.visuals.length;
        if (index >= nVisuals) return false;
        return true;
    }

    async buildVisualization(index){
        if (!this.indexIsValid(index)) return null;
        var visual = this.visuals[index];
        if (visual !== null) return visual;
        const visualInfo = this.rules.visuals[index];
        var { type , properties, url, data } = visualInfo;

        if (typeof(url) === 'string' && data == null){
            data = await d3.json(url);
            delete visualInfo.url;
            visualInfo.data = data;
        }

        const { visualHeight } = this.calculateHeight();
        const visualProperties = {...properties, height: visualHeight};
        // ddv.visualizations.builder
        visual = builder.buildVisualization({...visualInfo , properties: visualProperties});
        this.visuals[index] = visual;
        return visual;
    }

    refreshVisualization(index){
        if (!this.indexIsValid(index)) return null;
        var visual = this.visuals[index];
        if (visual == null) return;

        const { visualHeight } = this.calculateHeight();
        const { width } = this.properties;

        const newProps = {
            height: visualHeight,
            width: width,
        }

        visual.setProperties(newProps);
        visual.refresh();
    }
}

module.exports = VisualizationSeries;
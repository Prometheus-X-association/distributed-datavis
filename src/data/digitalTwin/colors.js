const DEFAULT_COLORS_1_CATEGORY = ['#08233B'];
const DEFAULT_COLORS_2_CATEGORIES = [];
const DEFAULT_COLORS_3_CATEGORIES = ["#58C69A","#E59476","#4DC3F9"];

function getDefaultColors(nCategories){
    const colors = [];
    if (typeof(nCategories) !== 'number') return [];

    if (nCategories == 1) return DEFAULT_COLORS_1_CATEGORY;
    if (nCategories == 3) return DEFAULT_COLORS_3_CATEGORIES;
    
    for (let i = 1; i <= nCategories; i++) {
        colors.push('#000000');
    }

    return colors;
}

function setColorsToMindMap(plot){
    if (plot == null) return;

    const customColors = Object.keys(plot.digitalTwin.properties.extraColorMaping);
    if (customColors.length > 0) return;

    const colors = generateColorsForPlot(plot);
    plot.setColors(colors);
}

function generateColorsForPlot(plot){
    if (plot == null) return [];
    const colors = plot.properties.colors;
    const hasCustomColors = plot.properties.hasCustomColors;
    if (hasCustomColors === true) return colors;
    const groupField = plot.properties.categoryField;
    const categoryCount = {};
    var newColors = [];

    const categories = Object.keys(plot._groupToColorIndex)
    categories.forEach( group => {
        categoryCount[group] = 0;
    });

    plot.getData().forEach(node => {
        var groups = node[groupField];
        if (!Array.isArray(groups)) groups = [groups];
        for (let i = 0; i < groups.length; i++) {
            const group = Number.parseFloat(groups[i]);
            if (!categoryCount.hasOwnProperty(group)){console.log(`Warning at SetColors() : Group '${group}' was not correctly identified`); continue;}
            categoryCount[group] += 1;    
        }
    });

    const nCategories = categories.length;
    if (nCategories == 1){
        newColors = DEFAULT_COLORS_1_CATEGORY;
        return newColors;
    } else if (nCategories == 2){
        const nNodesCat1 = categoryCount[categories[0]];
        const nNodesCat2 = categoryCount[categories[1]];
        if (nNodesCat1 == 1 && nNodesCat2 >= 1 ||
            nNodesCat1 >= 1 && nNodesCat2 == 1){
            newColors = ['#11A1F3','#ee5e0c'];
            return newColors;
        } else if (nNodesCat1 == 0 || nNodesCat2 == 0){
            newColors = ['#08233B','#08233B'];
            return newColors
        } else {
            newColors = ['#4DC3F9', '#E59476'];
        }
    } else if (nCategories == 3){
        newColors = DEFAULT_COLORS_3_CATEGORIES;
        return newColors;
    }
    return newColors;
}

function setSDGColorsInMap(plot){
    var colors = [
        "#E5243B",  // (1) No Poverty  - RED
        "#DDA63A",  // (2) Zero Hunger - MUSTARD
        "#4C9F38",  // (3) Good Health and Well-Being - KELLY GREEN
        "#C5192D",  // (4) Quality Education - DARK RED
        "#FF3A21",  // (5) Gender Equality - RED ORANGE
        "#26BDE2",  // (6) Clean Water and Sanitation - BRIGHT BLUE
        "#FCC30B",  // (7) Affordable and Clean Energy - YELLOW
        "#A21942",  // (8) Decent Work and Economic Growth - BURGUNDY RED
        "#FD6925",  // (9) Industry, Innovation and Infrastructure - ORANGE
        "#DD1367",  // (10) Reduced Inequalities - MAGENTA
        "#FD9D24",  // (11) Sustainable Cities and Communities - GOLDEN YELLOW
        "#BF8B2E",  // (12) Responsible consumption and Production - DARK MUSTARD
        "#3F7E44",  // (13) Climate Action - DARK GREEN
        "#0A97D9",  // (14) Life bellow water - BLUE
        "#56C02B",  // (15) Life on land - LIME GREEN
        "#00689D",  // (16) Peace, Justice and Strong Institutions - ROYAL BLUE
        "#19486A",  // (17) Partnerships for the goals - NAVY BLUE
    ]
  
    plot.setColors(colors);
  
    var groupToColorIndexAux = {
        "1":0, "2":1, "3":2, "4":3, "5":4, "6":5, "7":6, "8":7, "9":8, "10":9,
        "11":10, "12":11, "13":12, "14":13, "15":14, "16":15, "17":16,
    }
  
    var groupToColorIndex = plot._groupToColorIndex;
  
    Object.keys(groupToColorIndex).forEach( group => {
        if (!groupToColorIndexAux.hasOwnProperty(group)){
            console.log(`ERROR at setSDGColorsInMap() : Group ${group} is not part of SDG Data`);
            return;
        }
        groupToColorIndex[group] = groupToColorIndexAux[group];
    })
  
    plot._groupToColorIndex = groupToColorIndex;
    var legend = {
        1:"No Poverty",
        2:"Zero Hunger",
        3:"Good Health and Well-Being",
        4:"Quality Education",
        5:"Gender Equality",
        6:"Clean Water and Sanitation",
        7:"Affordable and Clean Energy",
        8:"Decent Work and Economic Growth",
        9:"Industry, Innovation and Infrastructure",
        10:"Reduced Inequalities",
        11:"Sustainable Cities and Communities",
        12:"Responsible consumption and Production",
        13:"Climate Action",
        14:"Life bellow water",
        15:"Life on land",
        16:"Peace, Justice and Strong Institutions",
        17:"Partnerships for the goals",
    }
    plot.setLegend(legend);
}

function configureMapWithSignals(plot) {
    var colors = [
        "#001773", // (1) Emerging
        "#6987ff", // (2) Constantly Increasing
        "#0090b8", // (3) Increasing in Last Map
        "#666666", // (4) Constant Values
        "#c4c4c4", // (5) Constant in Last Map
        "#c79f00", // (6) Constantly Dicreasing
        "#ed5300", // (7) Decreasing in the last Map
        "#990000", // (8) Disappearing
    ]

    plot.setColors(colors);

    var groupToColorIndexAux = {
        "1": 0, "2": 1, "3": 2, "4": 3, "5": 4, "6": 5, "7": 6, "8": 7,
    }

    plot._groupToColorIndex = groupToColorIndexAux;

    const props = {
        'scale': 'flat',
    }

    plot.setProperties(props);
}


const colors = {
    setSDGColorsInMap,
    setColorsToMindMap,
    generateColorsForPlot,
    configureMapWithSignals,
    getDefaultColors,
}

module.exports = colors;
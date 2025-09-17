const courses = require("../data/Courses");
const { detectFormat } = require("../data/format.utils");
const jobs = require("../data/Jobs");
const { CourseVisualizer } = require("./list/CourseVisualizer");
const { JobVisualizer } = require("./list/JobVisualizer");
const { buildWordMap } = require("./wordmap/builder");

function normalizeType(type){
    if (typeof(type) !== 'string') return type;
    type = type.toLowerCase()
    switch (type) {
        case 'hexagon':
        case 'wordmap':
        case 'hexagonmap':
            return 'hexagon'
        case 'coursevisualizer':
        case 'course':
        case 'courses':
        case 'trainings':
        case 'training':
            return 'courses'
        case 'jobs':
        case 'job':
        case 'jobvisualizer':
            return 'jobs';
        default:
            return type;
    }
}

function normalizeData(data, visualType, provider){
    if (typeof(provider) !== 'string') return data;

    if (visualType == 'jobs'){
        data = jobs.process(data, provider);
    } else if (visualType == 'courses'){
        data = courses.process(data, provider);
    }
    return data;
}

function buildVisualization(visualInfo){
    var { type, provider, properties, data } = visualInfo;
    type = normalizeType(type);
    var props = properties;
    data = normalizeData(data, type, provider);

    var visual = null;
    switch (type) {
        case 'hexagon':
            visual = buildWordMap(data,'hexagon',props);       
            break;
        case 'courses':
            visual = new CourseVisualizer(props);
            visual.draw(data);
            break;
        case 'jobs':
            visual = new JobVisualizer(props);
            visual.draw(data);
            break;
        default:
            break;
    }
    return visual;
}

function buildRulesForSingleMap(params){
    const { jsonUrl , data , title, subtitle } = params;
    delete params.jsonUrl;
    delete params.data;
    delete params.title;
    delete params.subtitle;

    const showTitle = typeof(title) == 'string';

    const rules = {
        visuals: [
            {
                title: title,
                subtitle: subtitle,
                type: 'HexagonMap',
                url: jsonUrl,
                data: data,
                properties: params,
            }
        ],
    
        'properties' : {showTitle, showButtons:false},
    }

    return rules;
}

function getRulesFromSignals(json){
    for (let i = 0; i < json.data.length; i++) {
        const element = json.data[i];
        element.type = "HexagonMap";
    }

    const rules = {
        "visuals": json.data,
        "properties": {
            "timeLabels": json.info.timeLabels,
        }
    }

    return rules;
}

async function buildRules(params){
    var { jsonUrl , rules } = params;
    try {
        if (typeof(rules) == 'string' && rules.trim().length > 0){
            rules = JSON.parse(rules);
            return rules;
        }

        const json = await d3.json(jsonUrl);
        const format = detectFormat(json);

        params.data = json;
        delete params.jsonUrl;

        if (format == 'digitalTwin'){
            return buildRulesForSingleMap(params);
        }

        if (format == 'signals'){
            return getRulesFromSignals(json);
        }

        if (format == 'rules') return json;
        // Else
        return {visuals:[], params:{}};

    } catch (error) {
        console.log(error);
        return {visuals:[], params:{}};
    }
    
}

const builder = {
    buildVisualization,
    buildRulesForSingleMap,
    buildRules,
}

module.exports = builder;
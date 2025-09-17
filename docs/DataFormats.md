# Standard Data Formats used by the Building Block

In this document you can find detailed information about the Standard Data Formats that will be used for the following cases:

- [Knowledge Graphs](#standard-data-format-for-graphs)
    - [Node](#structure-of-a-node)
    - [Source](#structure-of-a-source)
    - [Edge](#structure-of-an-edge)
    - [Graph](#general-structure-of-a-graph)
- [Courses](#standard-data-format-for-courses)
- [Job Recommendations](#standard-data-format-for-job-recommendations)
- [Visual Properties](#standard-data-format-for-visual-properties)
- [Configuration file of the DDV (rules.json)](#configuration-file-for-the-ddv-rulesjson)

## Standard Data Format for Graphs

Nodes represent objects or entities that can be connected between them. Those connections are called Edges. A Graph consist of a set of nodes and a set of edges.

We have defined a Standard Data Format to represent Graphs, defining some general rules about the structure, but allowing the future extension of the format, always respecting the initial structure.

### Structure of a Node

* **id:** Unique numerical value that identifies each Node
* **value:** Numerical value that can describe a particular aspect of the node, such as importance, intensity or frequecy.
* **label:** Textual value that describes a particula aspect of the node, such as its name.
* **group:** This attribute can be used to clasify nodes into different groups. It can be a simple string with the group identifier, or a list of group identifiers.
* **weight:** How descriptive the word / topic is. Small number means generic / fuzzy topic, bigger number means a descriptive topic.
* **sources:** List of References (ids) to the sources associated with the node.

Parameters marked with an asterisk (*) are mandatory.

```json
Node = {
    "id"(*) : Number,
    "value"(*) : Number,
    "label"(*) : String,
    "group"(*) : String | Array<String>,
    "weight" : Number,
    "sources" : Array<Number>,
}

Source = {
    "title"(*) : String,
    "url"(*) : String,
    "id"(*) : Number,
}
```

```json
{
    "id": 1,
    "value": 10,
    "label": "Data Science",
    "group": "1",
    "weight": 5,
    "sources": [
        1
    ]
}
```

```json
{
    "id": 11,
    "title":"Data Science (Wikipedia)",
    "url":"https://en.wikipedia.org/wiki/Data_science",
}
```

### Structure of an Edge

* **from:** Id of the node where the connection starts.
* **to:** Id of the node where the connection ends.

Graphs are processed by the building block as undirected graphs, this implies that: 

1. An Edge from A to B is equivalent to an edge from B to A.
2. You only need to define one edge to connect two nodes. Defining bidirectional edges (A to B and B to A) is redundant.

```
Edge = {
    from: id_nodeA,
    to: id_nodeB,
}
```

Example:

```json
{
    "from": 1,
    "to": 4,
}
```
### Structure of a Legend

The Groups that are present in a Graph are normally represented by simple values (group numbers for example). Legends associate each group with a more descriptive title, that facilitates the interpretation of the final results.

```json
Legends = {
    group1 : "Legend 1",
    group2 : "Legend 2",
    ...
}
```

Example:

```json
{
    "1": "Skills demand in French Labor Market on 2024",
    "2": "Skills from Bachelor's degree that are not demanded",
    "3": "Demanded Skills that are also included in the Bachelor's Degree"
}
```


### General Structure of a Graph

"Legends" is an optional attribute in the graph representation. They enable a **more descriptive labeling** of the groups present in the given Graph.

```json
{
    "data":{
        "nodes": Array<Node>,
        "edges": Array<Edge>,
        "legends": Legends,
        "sources": Array<Source>
    }
}
```

Example:

```json
{
    "data":{
        "nodes":[
            {"id":1, "label":"Monkey", "group":1, "sources":[1]},
            {"id":1, "label":"Panda", "group":1},
            {"id":1, "label":"Bambu", "group":2},
        ],

        "edges":[
            {"from":1, "to":2},
            {"from":2, "to":3},
        ],

        "sources":[{
            "title":"Primate (Wikipedia)",
            "url":"https://en.wikipedia.org/wiki/Primate",
            "id": 1,
        }],

        "legends":{
            "1":"Animals",
            "2":"Plants"
        }
    }
}
```

## Standard Data Format for Courses

The attribute names for courses can be defined using two different standard cases: underscore_case and camelCase.

```json
{
	"code": "Course code.",
	"url": "Link to the course.",
	"title": "Course title.",
	"description": "Description of the course.",
	"explanation": "Skills you have: x,y,z. Skills you will get: w, z, t.",
	"new_skills": ["New skill 1", "New skill 2"],
	"existing_skills": ["Existing skill 1","Exsiting skill 2"],
	"interests": ["Interest 1", "Interest 2"],
	"score": "Scoring index of the training recommendation.",
    "normalized_score": "Normalized Scoring Index of the training recommendation.",
    "language": "String in Free Format",
    "organization": "Organization that Provides the Training",
    "duration": "Duration of the Course. String in Free Format.",
    "price": "Price of the Course. String in Free Format."
}
```

## Standard Data Format for Job Recommendations

```json
{
	"url": "Link to the job post.",
	"author": "Name of the job portal the job is posted to.",
	"language": "Language of the job post.",
	"title": "Title of the job post.",
	"description": "Full description of the job post.",
	"location": "Location of the vacant (city / country). String in Free format",
	"time": "Date and time the job is posted.",
	"score": "Scoring index of the job recommendation.",
    "normalized_score": "Normalized Scoring Index of the training recommendation.",
	"matching_skills": ["Matching skill 1", "Matching skill 2", "Matching skill 3"],
	"missing_skills": ["Missing skill 1", "Missing skill 2", "Missing skill 3"]
}
```

## Standard Data Format for Visual Properties

Visual Properties are handled as a Dictionary where each Property name (key) has an associated value. Depending on the visualization, properties will have initial values that are configured by default. More details about this can be found in the section called [Properties](./framework/PropertiesDocumentation.md).

```json
Properties = {
    "propertyName1": "propertyValue1",
    "propertyName2": "propertyValue2",
    ...
}
```

## Configuration file for the DDV (rules.json)

**rules.json** contains the definition of the User Journey, including:

* Data sources where data will be fetched
* Raw data represented as a JSON Object, in case that final results are not persisted in any public route.
* Order in which User Journey should be displayed
* Global Custom Visual Configurations that apply for all the visualizations.
* Specific Custom Visual Configurations, in case that certain visuals require specific properties.
* Titles that facilitate the interpretation of the results.
* Button Titles that facilitate the navigation though the different stages of the User Journey.

```json
/** VisualizationInfo if data is persisted **/

VisualizationInfo = {
    "type": String,
    "properties": Properties,
    "title": String,
    "buttonTitle": String,
    "url": String,
}

/** VisualizationInfo if data is not persisted **/

VisualizationInfo = {
    "type": String,
    "properties": Properties,
    "title": String,
    "buttonTitle": String,
    "data": Object,
}

/** Format of the Configuration File **/

rules.json = {
	"visuals" : Array<VisualizationInfo>,
    "properties": Properties,
}

```

Example:

```json

{
    "visuals": [
        {
            "type": "HexagonMap",
            "url": "https://example.com/example.json",
            "properties": {"figSize":40},
            "title": "Skills Profile",
            "buttonTitle": "Skills",
        },{
            "type": "CourseRecommendations",
            "data": [{...},{...},{...}],
            "title": "Recommended Trainings",
            "buttonTitle": "Trainings",
        },{
            "type": "JobRecommendations",
            "data": [{...},{...},{...}],
            "title": "Possible Job Applications",
            "buttonTitle": "Jobs",
        }
    ],

    "properties" : {
        "fontSize": 14,
        "fontFamily": "Arial",
    },
}

```
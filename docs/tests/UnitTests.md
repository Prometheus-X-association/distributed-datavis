# Unit Tests

Given that the number of unit tests can increase significantly over the time, this document will try to group tests that are very similar under the same ID. 
The description of each case will make explicit these cases.

**Test Cases**

| Test Case ID | TC001 |
| --- | --- |
| Location | \_\_tests\_\_/properties/Properties.test.js |
| Description | Validate that the Properties Object is able to respect a list of predefined rules, modifying the values that respect the data types and keeping unmodified the values that will be overriden by incorrect values. |
| Inputs | Rules=age:number,color:string,happy:boolean -> SET age:10,happy:true -> SET age:15,happy:'invalid',color:0 |
| Expected Result | happy:true,age:15,color:undefined |

| Test Case ID | TC002 |
| --- | --- |
| Location | \_\_tests\_\_/properties/HexagonMap.test.js |
| Description | Validate that default properties of the Visualization are NOT modified by INCORRECT values. |
| Inputs | fontSize:'20px',margin:\[1\],hideLegend:'TrueA',nameField:\['name'\], ... |
| Expected Result | No modifications in the visual properties. |

| Test Case ID | TC003 |
| --- | --- |
| Location | \_\_tests\_\_/properties/HexagonMap.test.js |
| Description | Validate that default properties of the Visualization are modified by CORRECT values. |
| Inputs | fontSize:21,hideLegend:true,nameField:'label', ... |
| Expected Result | All the visual properties should correspond with the given values |


| Test Case ID | TC004 |
| --- | --- |
| Location | \_\_tests\_\_/visualizers/HexagonMap.test.js |
| Description | Validate that initialZoom modifies the initial position of the SVG |
| Inputs | initialZoom:1.5 |
| Expected Result | This value should be defined in the attribute called "transform", in the SVG container inside the Visualization. |


| Test Case ID | TC005 |
| --- | --- |
| Location | \_\_tests\_\_/visualizers/HexagonMap.test.js |
| Description | Validate that number of nodes rendered in the screen corresponds with the number of nodes in the given Graph |
| Inputs | Sample Graph at \_\_test\_\_/samples/DigitalTwin.sample |
| Expected Result | nNodes = 226 |

| Test Case ID | TC006 |
| --- | --- |
| Location | \_\_tests\_\_/visualizers/HexagonMap.test.js |
| Description | Validate that number of nodes rendered in the screen corresponds with the number of nodes in the given Graph |
| Inputs | Sample Graph at \_\_test\_\_/samples/DigitalTwin.sample |
| Expected Result | nNodes = 226 |


| Test Case ID | TC007 |
| --- | --- |
| Location | \_\_tests\_\_/visualizers/HexagonMap.test.js |
| Description | Validate that one random concept is correctly rendered in the screen. |
| Inputs | Sample Graph at \_\_test\_\_/samples/DigitalTwin.sample |
| Expected Result | nodeId attribute of the svg must correspond with the selected one. The background color of the hexagon must correspond with the custom color passed via Properties. The Font Family and and Font Size must also correspond with the custom values given. The size of the Hexagon must change during rendering and have specific measures based on the custom figure size specified. |

| Test Case ID | TC008 |
| --- | --- |
| Location | \_\_tests\_\_/visualizers/VisualizationSeries.test.js |
| Description | Validate that the map is responding correctly to the change between the list of visualizations. |
| Inputs | Sample rules.json that contains details about three visualizations: (1) Job Recommendations, (2) Digital Twins and (3) Course Recommendations. |
| Expected Result | The active action button must change accordingly, while the rest of buttons must be inactive. The title of the visuals must change in each transition. The Visualization must also change and render accordingly.  |

| Test Case ID | TC000 |
| --- | --- |
| Location | \_\_tests\_\_/sample/sample.test.js |
| Description | Template |
| Inputs |  |
| Expected Result |  |
| Actual Outcome |  |
| Status |  |
| Comments |  |

**Acceptance Criteria**

- Correct Visualization: For all test cases, the primary acceptance criterion is that the visualization accurately represents the data provided by the JSON URL (TC001).
- Functionality: Each feature (TC002, TC003, TC004) must work as specified in the input parameters for the test to pass.
- Performance: Visualizations should load within a reasonable time frame, without significant delays or performance issues, especially when testing with larger JSON files or higher complexity (evaluated across all test cases).
- Usability: The visualization must be user-friendly and interactive, allowing users to easily understand and explore the visualized data (TC002, TC003, TC006).
- The rendered must gracefully handle errors (TC007), providing clear and actionable error messages.

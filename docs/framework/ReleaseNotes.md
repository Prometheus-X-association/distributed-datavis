[Framework Documentation](../README.md)

# Release Notes

v0.4.X (Next Release)
* More detailed guides and documentation of each class.

v0.4.1
* HotFix: Source details is optional. Initial Normalization will be skipped if these are missing.

v0.4.0
* Completely new structure for sources in DigitalTwin / KnowledgeGraph content.
* Automatic normalization mechanisms to ensure retrocompatibility.

v0.3.8
* HotFix: getMaxGroup()
* HotFix: Custom colors and highlight

v0.3.7
* rules.json can be injected via URL

v0.3.6
* Highlight neighbors in a Graph.
* Color neighbors in a Graph.
* Added default flat color scaling for highlighted custom groups in a Graph.

v0.3.5
* Complete integration with Graph Series
* New mechanism to dynamically add groups to a WordMap, defining also color
* Added subtitle support to the visualizations
* BugFix: error normalizing parameters based on Arrays.

v0.3.4
* BuildRules from different JSON formats
* Improved HexagonMapWithTimeSeries
* Automated coloring for Series with signals

v0.3.3
* Supports graphs where nodes can belong to more than 1 group.

v0.3.2
* HotFix: Bad references to the current Visualization
* Added SkillsUtils for label normalization to underscore case and camel case.

v0.3.1
* HotFix: Handling event targets in multiple ways to have multi-browser support.

v0.3.0
* Linechart Visualizer implemented.
* HexagonMap with embedded Time Series (values parameter inside node information).
* Added showValues to the available actions on click in the Hexagon Map.
* Integrated Tooltip into HexagonMaps to show timeSeries as Linecharts

v0.2.7
* Added new Property for the Graph Management: Subgraph, which reduces the graph to the neighbourhood of the given concept.
* Added normalizeSkill function under SkillsUtils.

v0.2.6
* Implemented automated parsing for URL parameters
* Added a rules.json automatic builder for Single Maps
* BugFix: Merge dictionaries when adding custom rules to Properties
* BugFix: Multiple type validations and type normalizations in Visual Properties
* URL Parameter Processing implemented as reusable Utils

v0.2.5
* BugFix: Action buttons were not visible during group selection.
* Implemented documentation for UI tests and Unitary tests
* Re-structured testing section in the design document.

v0.2.4 (18/02/2025)
* Defined basic structure for automatized tests.
* BugFix: Error when initial properties had invalid values.
* BugFix: Prevents invalid values to override initial values during dictionary merging.
* Defined type rules for many visual properties.

v0.2.3 (12/02/2025)
* Application was containerized to guarantee reproducibility

v0.2.2 (09/02/2025)
* Added automated Tests using Jest.
* Defined file structure and dependencies for unitary and functional tests.

v0.2.1 (05/02/2025)
* HotFix: Bug with custom properties in rules.json
* Improved main mardown file
* Serve test files automatically in dev environment

v0.2.0 (18/11/2024)
* DDV supports responsive visualizations
* Job Visualizer implemented
* Improvements on Course Visualizer
* Transformation functions for Jobs and Trainings follow standard formats defined in the design documents
* Redefinition of internal sizes for SvgVisualizers

v0.1.1 (10/11/2024)
* Redefinition of the Design Document
* Adaptation of existing code to handle proposed custom properties from rules.json
* Multiple Fixes of Visual Bugs (colors, relevancy mode, only compounds).
* Re-Organization of the Documentation Files.

v0.1.0 (25/10/2024)
* First functional version of the BB.
* Full support on Course Visualization / Partial support on Graph Visualization.
* Definition of the base classes that support the main foundaments of the Visualization Framework.

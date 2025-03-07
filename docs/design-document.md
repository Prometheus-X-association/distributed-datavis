# Distributed data visualization BB – Design Document

Distributed Data Visualisation is an on-device building block to ease up building end-user UIs for showing data in an informative way. It allows AI providers to display the results of their analytics, predictions and recommendations.

The building block is a reusable, portable and multi-platform supported HTML5 / JavaSript & D3.js based component that can be displayed by UI provider from any source.

This concept is not only about presenting data in an accessible format, but also about revolutionizing the way data interacts across different platforms, ensuring data privacy and improving user control. With the Prometheus-X project at the forefront, a ground-breaking approach to handling education and career development data will redefine industry standards.

Distributed data visualization is a sophisticated framework designed to seamlessly manage and display data across multiple platforms. It enables AI providers to process datasets from different data providers and gain valuable insights such as recommendations, analysis and predictions. What makes this approach special is the ability to easily integrate these results into different applications and user interfaces (UI), making it a versatile tool for educational and professional development.

## Technical usage scenarios & Features

### Features/main functionalities

* A General Framework was developed to standardize the supported data formats, the general structure of the visualizers, and the simplification of repetitive tasks during the development of new visualizers (margin / padding management, visual customization, type validation)

* Implements a Properties handler that is able to normalize, transform and manage the definition of properties in the internal components (type validation / value normalization / prevent bad prop configuration / )

* Provides transformation function that can normalize data formats from different providers / partners. These transformation functions can be expanded eventually if needed.

* Visualize Course / Training recommendations

* Visualize Job Recommendations

* Visualize Graph Data as a Hexagonal Map, where user can explore the relationships between the different concepts / skills.

* Build Customized Stories that integrate multiple visualizations (built from the results of 1 or more different service offerings). Story structure is defined in the configuration called *rules.json*

* Easy mechanisms to customize the visual aspect of each component.

* Supports Responsiveness to easily adapt each visual component to different devices and different screen sizes.

* Basic Linechart implemented.

* Supports the visualization of Graph Series. This visualization will be expanded and improved eventually.

**User journey case 1:**

Use case description, value and goal: The use case will take as basis Pino a product from Solideos used by Korean citizens to store their diploma and learning credentials. Use information from Korean users' Diploma and Transcript to match job opportunities in the EU (France). Skills data extracted from the documents will be used for service providers in the EU to recommend potential employment opportunities.

Use case functionalities:

- A professional can share her/his skills data and visulise it
- A Job Matching service can visualize the match between job to be filled and candidate's skills
- A company can quickly visualise the match and gap between diploma and their skills demand.

**User journey case 2:**

Use case description, value and goal: LAB aims to prepare individuals for the job market by offering personalized training recommendations worldwide, leveraging skills data and partnerships with service providers like Headai, Inokufu, Rejustify, and Edunao. The goal is to equip learners with relevant skills for career success, enhancing employability and lifelong learning.

Use case functionalities:

- Personalized training recommendations based on skills data analysis.
- Access to high-quality training opportunities worldwide.
- Skills forecasting and analytics for anticipating future skill demands.
- Skills assessment and analysis to determine individual skills and areas for improvement.

**Generic user journey:**

1. Matilda has data about herself in several LMS/LXP
2. She's using a new learning provider and wants to receive personalised learning recommendations based on any/all her data
3. She can share her data from service provider to another and the results are displayed inside one of those
4. Service provider only has to integrate the data viz BB and PTX Connector into LMS/LXP

### Technical usage scenarios

Distributed Data Visualisation is a on-device building block meant to ease up building end-user UIs for showing data in informative way with a relevant story/journey. Visualiser requires a host system that runs the UI and that host system must configure its components (consent, contract) that are needed to operate this building block.

Because of the nature of this building block being slightly different than others, the reader of this document cannot assume all server-side-building-blocks behaviors to exist in this BB.

**Technical usage scenario 1:**

User would gives her/his consent, it triggers "API consumption" by sending the data as a payload to this API call to the AI, and the data will be returned by the protocol. In this flow, the connector of the edtech side would send the result of the AI service back to the edtech so that it could be shown to the user.

**Technical usage scenario 2:**

User gives her/his consent to datasets, data provider(s) gives contracts to datasets that are not personal data. The Host System is the main responsible of triggering the required exchanges. Once Host System fetches the final results of the exchanges, it can load the data into the DDV, specifying custom parameters if required.

Tech usage scenario in short

- Host system that runs UI calls the BB07 with 'rules.json' that contains
  - source urls where final results can be fetched
  - visualisation types
  - visualization parameters (customization)
- Host system loads the Visualiser
- User Journey is visualized

With Distributed Data Visualisation, Data providers and Data consumers can easily bring the results from their services to end users without developing all the visualization components on their own.

For exapmle, a LMS company using Moodle, can integrate the Distributed Data Visualisation directly to Moodle and so focus on their LMS provider role, while this building block encapsulates all the logic behind the visualization of the results.

## Requirements

**Functional requirements:**

- **FR01:** All datasets must be ready before launching the visualizer
- **FR02:** Individuals must consent to the use of their data
- **FR03:** Organization must sign a contract to transfer the data
- **FR04:** Distributed data visualizer is not responsible of the data, data quality and data validity. Other building blocks ensure data veracity.
- **FR05:** Building block visualizes the given data without manipulations or modifications.
- **FR06:** rules.json must contain all the necessary information (final results or location where they can be fetched) to visualize the user journey. Exact structure of rules.json is found at [Data Formats / rules.json](./DataFormats.md/#configuration-file-for-the-ddv-rulesjson)
- **FR07:** Further development:
  - **FR08:** BB07 must be able to include new data models by simple conversion table / mapping
  - **FR09:** BB07 must be able to include new visualisation scripts

**Performance requirements:**

- **PR01:** Response time for a big visualization; 60 seconds
- **PR02:** Response time for an average individual skills profile visualization; less than 1 second

**Security requirements:**

- **SR01:** DDV is not allowed to send or share data without specific consent and specific service decribed in rules.json
- **SR02:** DDV is not allowed to use software libraries that may share the data
- **SR03:** DDV is not allowed to store the data or collect logs about data or user identity

**Dependability requirements:**

**DR01:** In case of incomplete rules.json or data the DDV closes the process and returns error message.

**Operational requirements:**

- **OR01:** DDV requires a minimum memory of 30MB and a mimimum CPU time of 0.1 seconds. The exact consumptions will vary depending on the number of visualizations of each story and the size of the data in each moment of the story.
- **OR02:** Host system must support JavaScript.

## Integrations

### Direct Integrations with Other BBs

There is no direct integrations with other BBs.

### Integration with the Data Space Connector

DDV does not have a direct integration with the Data Space Connector.

DDV Building Block provides mechanisms to ease up the process of data visualization. It is designed as an independent component that can be imported and used in multiple platforms. Each Service Consumers must perform their respective data exchanges. Once data is acquired by the service consumer, Distributed Data Visualizer can be used to build a story integrating data from multiple exchanges.

## Relevant Standards

The standard data formats are applied in a way that the Building Block specific data model is convertible to any other model with standard tools. This could mean e.g. that 1) graph-data in JSON-LD format can be converted to a CSV table, where nodes and their values are only used. So this node-csv can be used directly in excel for drawing barcharts. 2) JSON-LD can be mapped in PowerBi and applied in any PowerBi report as such. The fundamental idea is to bring a universal skills data visualization building block and at the same time support any data visualization tool.

### Data Format Standards

- Standard data visualization models like tables and graphs
- Open source frameworks, like D3.js and Chartist.js (standard way to use)
- Data storing technologies, like browser-cookies (industry standard) and data-api:s (standard way to use)
- HTML5
- JavaSript
- JSON

### Mapping to DSSC Data Space Reference Architecture Model

The Data Interoperability pillar:

- Data Models: capabilities to define and use shared semantics in a data space. DDV FOLLOWS FULLY THIS DSSC BUILDING BLOCK
- Data Exchange: capabilities relating to the actual exchange and sharing of data. DDV FOLLOWS FULLY THIS DSSC BUILDING BLOCK
- Provenance and traceability: capabilities for tracking the process of data sharing, so it becomes traceable and compliant. DDV IS TRANSPARENT ON ALL ITS WORK AND FULLY SUPPORTS THIS DSSC BB. OTHER PTX BULIDING BLOCKS EXTENDS THIS CAPAPBILITY.

The Data Sovereignty and Trust pillar:

- Access and Usage Policies and Control: the ability to specify and policies within a given data space, by the data space authority and the individual participants. DDV FOLLOWS FULLY THIS DSSC BUILDING BLOCK
- Identity Management: the management of identities within a data space. DDV DO NOT HANDLE IDENTITIES AT ALL. IT ENABLES ANONYMOUS AND PSEUDONYMOUS USE.
- Trust: being able to verify that a participant of a data space adheres to certain rules. CONNECTOR ENSURES THAT.

The Data Value Creation pillar:

- Data, Services and Offering descriptions: this building block provides to data providers the tools to describe a data product. NOT VALID FOR DDV, NO LIMITATIONS OR RESTRICTIONS.
- Publication and Discovery: this building block allows data providers to publish the description of their data, services and offerings. NOT VALID FOR DDV, NO LIMITATIONS OR RESTRICTIONS.
- Marketplace: this building block provides marketplace capabilities. NOT VALID FOR DDV, NO LIMITATIONS OR RESTRICTIONS.

See full [DSSC](https://dssc.eu/space/DDP/117211137/DSSC+Delivery+Plan+-+Summary+of+assets+publication)

### GDPR Mapping

- Right to be informed: Individuals have the right to be informed about the collection and use of their personal data: NO DATA STORED
- Right of access: Individuals have the right to access their personal data held by an organization. NO DATA STORED
- Right to rectification: Individuals have the right to request the correction of inaccurate or incomplete personal data held by an organization: INDIVIDUAL SHOULD ACCESS THE DATA HOLDER SHE/HE HAS CONSENTED
- Right to erase deata (also known as the "right to be forgotten"): Individuals can request the deletion or removal of personal data in certain circumstances, such as when the data is no longer necessary for the purpose it was originally collected. NO DATA STORED/COLLECTED
- Right to restrict processing: Individuals have the right to request the restriction of the processing of their personal data in certain circumstances, such as when they contest the accuracy of the data or object to its processing. BB07 PROCESS ONLY CONSENTED DATA, IF NO CONSENT, NO PROCESSING.
- Right to data portability: Individuals have the right to receive their personal data in a structured, commonly used, and machine-readable format. USER ALREADY CONSENTS THE DATA, SO THE PORTABILITY HAS HAPPENED.
- Right to object: Individuals can object to the processing of their personal data for specific purposes, such as direct marketing or profiling. INDIVIDUAL SEE ALL THE PROCESSED OUTCOMES. NO OTHER PROCESSING IS DONE.
- Rights in relation to automated decision-making and profiling: Individuals have the right not to be subject to a decision based solely on automated processing, including profiling, which has legal or similarly significant effects on them. They can request human intervention or challenge the decision. NO DECISION IS MADE. THIS IS ABOUT INFORMING INDIVIDUAL WHAT POSSIBILITIES THE DATA SHOWS.

### AI Act Mapping

- Unacceptable risk: AI applications that fall under this category are banned. DVV NO NOT HAVE ANY FEATURES DESCROBED IN THIS CATEGORY.
- High-risk: the AI applications that pose significant threats to health, safety, or the fundamental rights of persons. DVV NO NOT HAVE ANY FEATURES DESCROBED IN THIS CATEGORY.
- General-purpose AI ("GPAI"): this category includes in particular foundation models. They are subject to transparency requirements. EVEN THOUGH DDV DO NOT BELONG TO THIS CATEGORY, IT IS FULLY TRANSPARENT.
- Limited risk: these systems are subject to transparency obligations because of possible manipulation: DVV IS TRANSPARENT AND ALL THE VISUALISATIONS AND RECOMMENDATIONS ARE TRACEABLE.
- Minimal risk: this includes for example AI systems used for video games or spam filters. DDV BELONGS TO THIS CATEORY AND THUS IT IS TRANSPARENT BY DESIGN.

## Input / Output Data

You can find detailed explanation about the formats that are supported by the building block in the section [Data Formats](./DataFormats.md).

**Important Clarification:** Third Parties and Members of the Data Space must ensure that results are being fetched exchanging data through the Data Space Connectors. Contracts and Consents ensures important quality aspects such as transparency, security and veracity during the data exchange.

**Input data format:**

Host system can configure the DDV defining a JSON Object called [rules.json](./DataFormats.md/#configuration-file-for-the-ddv-rulesjson). This Object defines the data that will be displayed in the Host System, the order in which each visualization will be displayed, and custom visual properties.

**Output data format:**

DDV will render the different visualizations in a centralized component. The content will be rendered using enriched HTML and SVG.

**Use case 1 (Job recommendations)**

BB displays a list of Job Recommendations in an interactive and user friendly frame, through the JavaScript web component.

[Data Formats / Standard Data Format for Job Recommendations](./DataFormats.md/#standard-data-format-for-job-recommendations)

**Use case 2 (Training recommendations)**

BB displays a list of Training recommendations in an interactive and user friendly frame, through the JavaScript web component.

[Data Formats / Standard Data Format for Course Recommendations](./DataFormats.md/#standard-data-format-for-courses)


## Architecture

```mermaid
---
title: Distributed Data Visualisation
---

classDiagram
    class Api1["API (optional services for building and working with data)"]
    class Api2["API (optional services for running analysis)"]
    Data --> Api1
    Api1 --|> Visualisation
    Api1 --|> Api2
    Api2 --|> Visualisation
    Data : +Consent
    Data : +Contract
    Data : +Snowflake, Data Excahnge()
    Data : +National data sources like Sisu, Peppi, etc.()
    Data : +Free text()
    Data : +Consent services like Visions, Vastuu, Koski()
    Api1 : +Data normalisers like Build Knowlegde Graph
    Api1 : +Data structure builders like Text To Knowledge Graph
    Api1 : +Personal Data Storages like Inokufu, Cozy Cloud, Digital Twin Storage, etc()
    Visualisation: +Hexagon
    Visualisation: +CourseList
    Visualisation: +JobList
    Visualisation: +VisualizationGroup (development)
    Visualisation: +Linechart (development)
    Api2 : +Recommendation services like Headai Compass or MindMatcher recommendation
    Api2 : +Gap analysys services like Headai Score

```

## Dynamic Behaviour

The sequence diagram shows how the component communicates with other components.

### Non personal data

For scenarios where personal data is not involved, the consent is not required and only contracts between the participants & the DDV.

```mermaid
---
title: Distributed Visualisation Sequence Diagram (Non Personal Data)
---

sequenceDiagram
    participant ddv as DDV
    participant host as Host System (UI Provider)
    participant dc as Data Consumer
    participant dccon as Data Consumer Connector
    participant con as Contract Service
    participant dpcon as Data Provider Connector
    participant dp as Data Provider
    
    host -) dccon: Get Contract Information (provide contract ID)
    con --) dc: Verified Contract


    loop For n amount of Services that are in the contract
    dc -) dccon: Trigger data exchange<br>BY USING CONTRACT
    dccon -) con: Verify Resources involved <br> in the exchange  (w/ contract & policies)
    con -) dccon : Contract validated
    dccon -) dpcon: Data request + contract
    dpcon -) dp: GET data
    dp --) dpcon: Data Resource <br> Fetched
    dpcon --) dccon: Data Exchange
    dccon --) dc: Data sent to payload <br> representation URL

    end

    host -) dc: Collect results <br> sent by the connector
    dc -) host: Results from each service
    host -) ddv: HTTP request or <br> direct usage of the JS Library
    Note over ddv: rules.json
    ddv -)  host: JavaScript Component
```

### Personal Data

For scenarios where personal data is involved, the consent is required and must be verified on top of the existing contracts between the participants.

```mermaid
---
title: Distributed Visualisation Sequence Diagram (With Personal Data)
---

sequenceDiagram
    participant ddv as DDV
    participant host as Host System (UI Provider)
    participant dc as Data Consumer
    participant dccon as Data Consumer Connector
    participant con as Contract Service
    participant cons as Consent Service
    participant dpcon as Data Provider Connector
    participant dp as Data Provider
    
    host -) dccon: Get Personal information under Consent
    con --) dc: Verified Contract

    dc -) dccon: Verify Consent Validity
    dccon -) con: Verify Consent Validity
    con -) dccon : Consent validated

    host -) dccon: Get Contract Information (provide contract ID)
    con --) dc: Verified Contract

    loop For n amount of Services that are in the contract
    dc -) dccon: Trigger data exchange <br>  with CONTRACT & CONSENT
    dccon -) con: Verify Resources involved <br> in the exchange  (w/ contract & policies)
    con -) dccon : Contract validated
    dccon -) dpcon: Data request + contract
    dpcon -) dp: GET Personal data
    dp --) dpcon: Personal Data
    dpcon --) dccon: Data Exchange of Personal Data
    dccon --) dc: Results from Service sent to <br> payload representation URL
    end

    host -) dc: Collect results <br> sent by the connector
    dc -) host: Results from each service
    host -) ddv: HTTP request or <br> direct usage of the JS Library
    Note over ddv: rules.json
    ddv -)  host: JavaScript Component
```

## Configuration and deployment settings

Configuration of the BB07 can be done in three places

- rules.json (see section [Input / Output Data](#input--output-data))
- parameters given in visualizer HTTP-GET (see section [OpenAPI Specifications](#openapi-specification))
- parameters passed to the Visualization constructors or builders in case that Host Provider is using the JS Library directly (see section [Input / Output Data](#input--output-data)).

The given parameters follow REST-API type of GET parameters, so only values that could be publicly seen or strongly encrypted values are allowed.

### Error Scenarios

#### Incorrect data format

The configuration file called[rules.json](./DataFormats.md/#configuration-file-for-the-ddv-rulesjson) follows a specific format. The absence of a mandatory field aborts the process of visualization and displays a warning message in the screen.

#### Invalid or Unaccesible Data URL

DDV consumer may define URLs that are not accesible without Authentication methods (E.j HTTP 404 / HTTP 403 Errors) or URLs with incorrect formatting. In these cases, DDV will show a warning message specifying that resources could not be fetched.

#### Size of the input data incompatible with available computational resources

Complexity to process and render Graphs (Digital Twins) will depend on the number of nodes, and the level of interconectivity between them (edges). Maps with more than 5000 nodes and huge level of interconnectivity may start being difficult to be processed in conventional computers.


## Third Party Components & Licenses

Background Component: D3.js Available at D3.js Git https://github.com/d3/d3

D3.js is licensed under the ISC License. https://github.com/d3/d3/blob/main/LICENSE

In order to maximise cyber security we have isolated d3.js online-dependencies in current development version, which may cause small differences on how code behaviors when developed further. This decison may change during the development.

## OpenAPI Specification

- Customize Visual Style of Visualizations
- Strong Validation of URL Parameters (data type verification, default values for parameters, warning messages in the screen)
- Full-Screen Mode to enable external embeddings in IFrames, this mode will hide buttons and sidebar columns. It also activates Responsive Mode (minWidth and maxWidth)
- Store Visualization as PNG or SVG
- Receive custom parameters via URL

### Full URL Example, development version

- https://megatron.headai.com/HeadaiVisualizer.html?&color_scale=log&json_url=https://megatron.headai.com/analysis/BuildSignals/BuildSignals_xwiaHk1n3p1672366166478.json

### URL Parameters

All the parameters that can be passed via URL to the component are described in the document called [Properties Documentation](./framework/PropertiesDocumentation.md).

## Test specification

### Test plan

The objective of testing the "Distributed Data Visualization" function is two-fold:

1. To verify that it accurately builds a visualization based on the given parameters, ensuring that the output is correct, reliable, and efficient over varying conditions.

2. To confirm that the Distributed Data Visualization accurately represents the data provided by the JSON URLs. This involves verifying that all nodes, connections, and groups in the visualization correctly correspond to the data structure and content specified in the JSON file.

Scope of Functional Tests includes:

- Rendering of visualizations based on JSON data.
- Full-screen mode functionality and its impact on user experience.
- User interactions with the visualization, including zooming, focusing on nodes, and click actions.
- Color coding and scaling to accurately represent different groups within the data.
- Filtering capabilities to display nodes based on specific criteria such as weight or word types.
- Ensuring all parameters are correctly accepted and validated by the function.
- Testing how the rendering deals with incorrect or incomplete input parameters.

Resulting users can effectively interact with and derive insights from visualized data, reflecting accurate and meaningful information as intended by the data source.

**Technical Description of Test Plan**

This test plan outlines a comprehensive approach combining black box testing methodologies with automated testing routines to ensure functional accuracy, performance under various conditions, optimal response times, and resilience against anomalies in the system. The strategy leverages industry-standard tools and methodologies to achieve a high level of software quality and reliability.

Using this approach it is possible to achieve the following:

- Validate the accuracy of the application's outputs against defined functional requirements.
- Ensure the application performs consistently under different load conditions.
- Verify that the application meets its performance benchmarks in terms of response times under normal and peak loads.
- Assess the application's capability to handle and recover from unexpected events or inputs without critical failures.

**Methodologies**

Black Box Testing: This approach focuses on testing software functionality without knowledge of the internal workings. Test cases will be derived from functional specifications to verify the correctness of output based on varied inputs. This method effectively simulates user interactions and scenarios.

Automated Testing Routines: Automating the execution of repetitive but essential test cases ensures comprehensive coverage, consistency in test execution, and efficient use of resources.

**Introduction of the tools used**

Headai Quality Assurance Framework for AI: 100% proprietary testing infrastructure for Natural Language Processing development. This framework facilitates the creation of repeatable automated tests in the Java environment. In particular, the attention is on backend testing, service-level testing, and integration testing, offering features for assertions, test grouping, and test lifecycle management. This framework has dashboards and reporting tools integrated with the testing tool to monitor test executions, outcomes, and performance trends over time.

Selenium: For web-based applications, Selenium automates browsers, enabling the testing of web applications across various browsers and platforms. It's instrumental in performing end-to-end functional testing and verifying the correctness of web elements and response times.

Postman: For RESTful APIs, Postman allows the execution of API requests to validate responses, status codes, and response times. It supports automated testing through scripting and collection runners, making it ideal for testing API endpoints.

By combining black box testing with automated routines, this test plan will fully meet the requirements of the Distributed Data Visualization (“DDV”) block including but not restricted to its:

- Functional requirements
- Security requirements
- Dependability requirements
- Operational requirements

A comprehensive evaluation of the Distributed Data Visualization's functionality, performance, resilience, and operational readiness will enhance its robustness in managing anomalies. The use of these specific tools and methodologies enhances the effectiveness of testing efforts, leading to a robust, reliable, and high-performing application ready for production deployment.

### Unit tests

You can find details about the unit tests in this [link](./tests/UnitTests.md).

### Component-level testing

The Distributed Data Visualizer does not integrate its funcionalities with the Dataspace connector or with other Building Blocks in a direct way. For this reason, Component-level tests will be empty.

### UI tests

You can find details about the UI tests in this [link](./tests/UI_Tests.md).

### Partnerships & Roles

#### Headai

- Data flows, data formats, security and privacy
- Visualizer implementation (programming)
- Source code documentation and example case building
- Preparing the distributed data visualizer to be Creative Commons / Open Source BB
- Dissemnination and PR

#### Visions

- Connector-specific work (programming) and expertise, including consent, contract and catalogue and documentation support
- Data space building blocks architecture

#### EDUNAO

- Domain-specific insights to end user
- LMS integration, including connector work, user management and possible data conversions
- Building and documenting and exaple integration case to be published
- UX Testing and reporting the findings in details
- Host system operator (See dynamic sequence diagram)

#### IMT

- Domain-specific insights to end user
- LMS integration, including connector work, user management and possible data conversions
- Building and documenting and exaple integration case to be published
- UX Testing and reporting the findings in details
- Host system operator (See dynamic sequence diagram)

### Usage in the dataspace

![Screenshot 2024-05-22 at 15.53.01](https://hackmd.io/_uploads/Hk9ghwoQC.png)

#### Data Route

1 : Data from the Learning Management System (LMS) is tracked in the Learning Record Store (LRS)

2 : The LRS transmits data to the Learning Record Converter (LRC) in a format other than xAPI

3 : The LRC converts the data into xAPI format and sends it to the Prometheus-X Dataspace Connector (PDC)

4 : The PDC requests validation for transferring data to individual X, which includes their identity, catalogue, contract, and consent

5 : The data intermediary sends the terms of the contract, identity, catalogue, and consent of individual X

6 : The PDC of organization A sends a data set in xAPI format to the PDC of individual X

7 : The PDC of individual X transfers data in xAPI format to its Personal Learning Record Store (PLRS)

4 : The PDC requests validation to transfer data to organization B. This involves confirming the organization's identity, catalogue, contract, and consent

5 : The data intermediary sends the terms of the contract, identity, catalogue, and consent of organization B

8 : PDC of organization A sends a data set in xAPI format to the PDC of organization B

9 : The PDC of individual X requests validation to send data to organization B, which involves identity, catalogue, contract, and consent

10 : The data intermediary sends the terms of the contract, identity, catalogue, and consent of organization B

11 : The PDC of individual X sends a data set in xAPI format to the PDC of organization B

12 : The PDC sends data to the Data Value Chain Tracker (DVCT) in xAPI format and applies the commercial terms of the data-sharing contract

13 : The PDC sends data to the Data Veracity Assurance (DVA) in xAPI format, ensuring the accuracy of specific data exchanges in the database

14 : Organization B sends the data received from the data exchanges of the PDC to the Distributed Data Visualization (DDV) in xAPI format.

15 : The DDV visualizes the received traces, following the custom structure defined in the configuration file *rules.json

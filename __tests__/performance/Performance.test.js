/**
 * DDV performance baseline
 *
 * A reproducible load test on sample and synthetic data, checked against the
 * limits declared in docs/design-document.md:
 *
 *   PR01  Response time for a big visualization: 60 seconds
 *   PR02  Response time for an average individual skills profile: less than 1 second
 *   OR01  DDV requires a minimum memory of 30 MB
 *   "Maps with more than 5000 nodes ... may start being difficult to be processed"
 *
 * Scenarios
 *   1. Average skills profile: the repository sample (DigitalTwin.sample.js), median of 5 runs.
 *   2. Recommendation lists: synthetic course and job lists of 20 and 1000 items.
 *   3. Scaling series: synthetic skills graphs of 250 to 5000 nodes with the same edge
 *      density as the sample, generated from a fixed seed so every run uses identical data.
 *      They run last because the largest maps leave the biggest heap behind.
 *
 * What is measured, per scenario
 *   Time        building the visualization and rendering it into the page (response time)
 *   Processing  for graphs, the part spent preparing the data and computing the map layout
 *   CPU         process CPU time (user + system) during the run
 *   Memory      heap retained by the visualization while it is on the page, after garbage collection
 *               (largest value across the runs of a scenario)
 *
 * The test runs in jsdom, like the rest of the suite: it measures DDV's own JavaScript and
 * DOM building, not the browser's layout and painting, so a real browser adds some time on top.
 *
 * Run
 *   npm test                                  whole suite, including this file
 *   npm test -- __tests__/performance         this file only
 *   DDV_PERF_REPORT=perf-report npm test -- __tests__/performance
 *                                             also writes perf-report/performance-report.{json,md}
 */

import * as d3Core from 'd3';
import { hexbin as d3hexbin } from 'd3-hexbin';

const d3 = { ...d3Core, hexbin: d3hexbin };
global.d3 = d3;

// Jest Dependencies - Configuration JSDOM
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import fs from 'fs';
import os from 'os';
import path from 'path';
import v8 from 'v8';
import vm from 'vm';
import { execSync } from 'child_process';

import * as ddv from '../../src/index.js';
import { digitalTwinJson } from '../samples/DigitalTwin.sample.js';

// ------------------------------------------------------------------
// Declared limits (docs/design-document.md)
// ------------------------------------------------------------------
const LIMITS = {
    PR01_BIG_VISUALIZATION_MS: 60_000,
    PR02_AVERAGE_PROFILE_MS: 1_000,
    OR01_MEMORY_MB: 30,
};

const GRAPH_SIZES = [250, 500, 1000, 2500, 5000];
const LIST_SIZES = [20, 1000];
const AVERAGE_PROFILE_RUNS = 5;
const SEED = 20261110;
const TEST_TIMEOUT_MS = 2 * LIMITS.PR01_BIG_VISUALIZATION_MS;

const PLOT_PROPS = { width: 1200, height: 800 };

// ------------------------------------------------------------------
// Memory: force garbage collection so heap figures are comparable
// ------------------------------------------------------------------
let gc = null;
try {
    v8.setFlagsFromString('--expose_gc');
    gc = vm.runInNewContext('gc');
} catch (error) {
    gc = null; // memory figures are then approximate and the OR01 check is skipped
}

function heapAfterGc() {
    if (gc) gc();
    return process.memoryUsage().heapUsed;
}

// ------------------------------------------------------------------
// Synthetic data, shaped like the repository sample
// ------------------------------------------------------------------
function mulberry32(seed) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function describeSample(json) {
    const { nodes, edges } = json.data;
    const range = (key) => [Math.min(...nodes.map(n => n[key])), Math.max(...nodes.map(n => n[key]))];
    return {
        nodes: nodes.length,
        edges: edges.length,
        edgesPerNode: edges.length / nodes.length,
        valueRange: range('value'),
        weightRange: range('weight'),
    };
}

function syntheticDigitalTwin(nodeCount, shape, seed = SEED) {
    const random = mulberry32(seed + nodeCount);
    const between = ([min, max]) => min + Math.floor(random() * (max - min + 1));

    const nodes = [];
    for (let id = 0; id < nodeCount; id++) {
        nodes.push({
            id,
            value: between(shape.valueRange),
            label: `synthetic_skill_${id}`,
            weight: between(shape.weightRange),
            group: '1',
            search_center: 'false',
            sources: [{ title: 'Synthetic profile', url: 'Synthetic profile' }],
            explain_api_call: '',
            relations: [],
        });
    }

    const edgeCount = Math.round(nodeCount * shape.edgesPerNode);
    const edges = [];
    const seen = new Set();
    while (edges.length < edgeCount) {
        const from = Math.floor(random() * nodeCount);
        const to = Math.floor(random() * nodeCount);
        const key = `${from}-${to}`;
        if (from === to || seen.has(key)) continue;
        seen.add(key);
        edges.push({
            from,
            to,
            value: between(shape.weightRange),
            title: `synthetic_skill_${from} - synthetic_skill_${to}`,
        });
    }

    return {
        info: { sources: { document: 'synthetic' }, build: { algorithm: 'ddv-performance-test' } },
        data: {
            unique_identifier: `synthetic-${nodeCount}`,
            legends: { '1': 'Synthetic profile' },
            nodes,
            edges,
        },
    };
}

function syntheticCourses(count) {
    return Array.from({ length: count }, (_, i) => ({
        code: `SYN-${i}`,
        url: 'https://example.org/course',
        title: `Synthetic course ${i}`,
        description: 'Synthetic course used for the DDV performance baseline.',
        explanation: 'Skills you have: x, y. Skills you will get: z.',
        new_skills: ['model_evaluation', 'ideation'],
        existing_skills: ['language_models', 'neural_networks'],
        interests: ['data_science'],
        score: 10.4,
        normalized_score: 0.8,
        language: 'English',
        organization: 'Synthetic University',
        duration: '8 hours',
        price: '€ 10',
    }));
}

function syntheticJobs(count) {
    return Array.from({ length: count }, (_, i) => ({
        url: 'https://example.org/job',
        author: 'Synthetic Company',
        language: 'English',
        title: `Synthetic job ${i}`,
        description: 'Synthetic job ad used for the DDV performance baseline.',
        location: 'Helsinki, Finland',
        time: '08/11/2024',
        score: 10.4,
        normalized_score: 0.8,
        matching_skills: ['language_models', 'python'],
        missing_skills: ['reinforcement_learning'],
    }));
}

// ------------------------------------------------------------------
// Rendering with the existing DDV API
// ------------------------------------------------------------------
const clone = (data) => JSON.parse(JSON.stringify(data));

function renderGraph(json, selector) {
    const start = performance.now();
    const plot = ddv.visualizers.wordmap.buildWordMap(json, 'hexagon', { ...PLOT_PROPS });
    const processingMs = performance.now() - start;
    plot.attachOn(selector);
    plot.refresh();
    return { processingMs, drawn: d3.select(selector).selectAll('svg.concept').size() };
}

function renderList(Visualizer, items, selector) {
    const visual = new Visualizer({});
    visual.attachOn(selector);
    visual.draw(items);
    if (typeof visual.refresh === 'function') visual.refresh();
    return { processingMs: null, drawn: d3.select(selector).selectAll('li.listElement').size() };
}

let containerCount = 0;

const nextTick = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Removes a rendered visualization so the next run starts from a clean page: stops pending
 * d3 transitions, clears and removes the container, then lets the event loop turn so d3's
 * timers release their references. Without this, every run stays in memory, which distorts
 * the memory figures and slows later scenarios with garbage collection.
 */
async function removeVisualization(selector) {
    const container = d3.select(selector);
    container.selectAll('*').interrupt();
    const node = container.node();
    if (node) {
        node.innerHTML = '';
        node.remove();
    }
    await nextTick();
}

/**
 * Runs `render` on a fresh copy of the data `runs` times. Time and CPU come from the median
 * run; memory is the largest value across runs, since memory released from an earlier
 * scenario during a run can make a single reading too low. Copying the data is not timed.
 */
async function measure(data, render, runs = 1) {
    const samples = [];
    for (let i = 0; i < runs; i++) {
        const id = `ddv-perf-${++containerCount}`;
        d3.select('body').append('div').attr('id', id);
        const selector = `div#${id}`;
        const input = clone(data);

        const heapBefore = heapAfterGc();
        const cpuBefore = process.cpuUsage();
        const start = performance.now();

        const { processingMs, drawn } = render(input, selector);

        const timeMs = performance.now() - start;
        const cpu = process.cpuUsage(cpuBefore);
        const retainedMb = (heapAfterGc() - heapBefore) / 1e6;

        await removeVisualization(selector);
        samples.push({ timeMs, processingMs, cpuMs: (cpu.user + cpu.system) / 1000, retainedMb, drawn });
    }
    const memoryMb = Math.max(...samples.map(s => s.retainedMb));
    samples.sort((a, b) => a.timeMs - b.timeMs);
    return { ...samples[Math.floor(samples.length / 2)], retainedMb: memoryMb, runs };
}

// ------------------------------------------------------------------
// Results and report
// ------------------------------------------------------------------
const results = [];

function record(scenario, size, result, limit) {
    const entry = {
        scenario,
        size,
        runs: result.runs,
        timeMs: Math.round(result.timeMs),
        processingMs: result.processingMs == null ? null : Math.round(result.processingMs),
        cpuMs: Math.round(result.cpuMs),
        retainedMb: gc ? Number(result.retainedMb.toFixed(1)) : null,
        drawn: result.drawn,
        limit: limit ? limit.label : null,
        withinLimit: limit ? limit.check(result) : null,
    };
    results.push(entry);
    return entry;
}

function readJson(file) {
    try { return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), file), 'utf8')); } catch { return {}; }
}

function environment() {
    let commit = null;
    try { commit = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { /* not a git checkout */ }
    const cpus = os.cpus();
    return {
        date: new Date().toISOString(),
        ddvVersion: readJson('package.json').version || null,
        commit,
        node: process.version,
        jsdom: readJson('node_modules/jsdom/package.json').version || null,
        d3: readJson('node_modules/d3/package.json').version || null,
        platform: `${os.platform()} ${os.arch()}`,
        cpu: cpus.length ? `${cpus[0].model} (${cpus.length} cores)` : null,
        totalMemoryGb: Number((os.totalmem() / 1e9).toFixed(1)),
        memoryMeasurement: gc ? 'heap after forced garbage collection' : 'approximate (garbage collection not available)',
    };
}

function markdownReport(env) {
    const cell = (value) => (value == null ? '–' : String(value));
    const lines = [
        '# DDV performance baseline',
        '',
        `Date: ${env.date} · DDV ${cell(env.ddvVersion)}${env.commit ? ` (${env.commit})` : ''} · Node ${env.node} · jsdom ${cell(env.jsdom)} · ${cell(env.cpu)}`,
        '',
        '| Scenario | Size | Runs | Time (ms) | Processing (ms) | CPU (ms) | Memory (MB) | Limit | Within limit |',
        '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
        ...results.map(r => `| ${r.scenario} | ${r.size} | ${r.runs} | ${r.timeMs} | ${cell(r.processingMs)} | ${r.cpuMs} | ${cell(r.retainedMb)} | ${cell(r.limit)} | ${r.withinLimit == null ? '–' : (r.withinLimit ? 'yes' : 'NO')} |`),
        '',
        'Time and CPU = building and rendering the visualization (median of the runs). Memory = heap retained while the visualization is on the page (largest across runs).',
        'Measured in jsdom: browser layout and painting are not included.',
    ];
    return lines.join('\n');
}

// ------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------
const sampleShape = describeSample(digitalTwinJson);
const withinPr01 = { label: 'PR01 ≤ 60 s', check: (r) => r.timeMs <= LIMITS.PR01_BIG_VISUALIZATION_MS };

describe('DDV performance baseline (C5)', () => {
    let averageProfile = null;

    beforeAll(async () => {
        // Warm-up run, not recorded: the first render also pays for loading and compiling code
        await measure(digitalTwinJson, renderGraph, 1);
    }, TEST_TIMEOUT_MS);

    test('PR02: average skills profile (repository sample) renders in under 1 second', async () => {
        averageProfile = await measure(digitalTwinJson, renderGraph, AVERAGE_PROFILE_RUNS);
        record('Average skills profile (sample)', `${sampleShape.nodes} nodes, ${sampleShape.edges} edges`, averageProfile,
            { label: 'PR02 < 1 s', check: (r) => r.timeMs < LIMITS.PR02_AVERAGE_PROFILE_MS });

        expect(averageProfile.drawn).toBe(sampleShape.nodes);
        expect(averageProfile.timeMs).toBeLessThan(LIMITS.PR02_AVERAGE_PROFILE_MS);
    }, TEST_TIMEOUT_MS);

    test('OR01: average skills profile fits in the declared 30 MB', () => {
        if (!gc || !averageProfile) {
            console.warn('OR01 check skipped: memory could not be measured exactly');
            return;
        }
        expect(averageProfile.retainedMb).toBeLessThanOrEqual(LIMITS.OR01_MEMORY_MB);
    });

    test.each(LIST_SIZES)('PR01: course and job lists with %i items render within 60 seconds', async (count) => {
        const { CourseVisualizer, JobVisualizer } = ddv.visualizers.list;
        const courses = await measure(syntheticCourses(count), (data, sel) => renderList(CourseVisualizer, data, sel), 3);
        const jobs = await measure(syntheticJobs(count), (data, sel) => renderList(JobVisualizer, data, sel), 3);
        record('Course recommendations', `${count} items`, courses, withinPr01);
        record('Job recommendations', `${count} items`, jobs, withinPr01);

        expect(courses.drawn).toBe(count);
        expect(jobs.drawn).toBe(count);
        expect(courses.timeMs).toBeLessThanOrEqual(LIMITS.PR01_BIG_VISUALIZATION_MS);
        expect(jobs.timeMs).toBeLessThanOrEqual(LIMITS.PR01_BIG_VISUALIZATION_MS);
    }, TEST_TIMEOUT_MS);

    test.each(GRAPH_SIZES)('PR01: synthetic skills graph with %i nodes renders within 60 seconds', async (nodeCount) => {
        const graph = syntheticDigitalTwin(nodeCount, sampleShape);
        const result = await measure(graph, renderGraph, nodeCount <= 1000 ? 3 : 1);
        record('Synthetic skills graph', `${nodeCount} nodes, ${graph.data.edges.length} edges`, result, withinPr01);

        expect(result.drawn).toBe(nodeCount);
        expect(result.timeMs).toBeLessThanOrEqual(LIMITS.PR01_BIG_VISUALIZATION_MS);
    }, TEST_TIMEOUT_MS);

    afterAll(() => {
        const env = environment();
        const report = markdownReport(env);
        console.info(`\n${report}\n`);

        const outputDir = process.env.DDV_PERF_REPORT;
        if (outputDir) {
            fs.mkdirSync(outputDir, { recursive: true });
            fs.writeFileSync(path.join(outputDir, 'performance-report.json'),
                JSON.stringify({ environment: env, limits: LIMITS, results }, null, 2));
            fs.writeFileSync(path.join(outputDir, 'performance-report.md'), `${report}\n`);
        }
    });
});
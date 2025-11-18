function process(data, provider){
    if (provider == 'headai'){
        return processJobsHeadai(data);
    } else {
        return null;
    }
}

function processJobsHeadai(data){
    const processed = [];

    const keys = [
        'recommendations_based_on_extensive_skills',
        'recommendations_based_on_match',
        'recommendations_based_on_learning_paths',
        'recommendations_based_on_matching_skills',
        'recommendations_based_on_skills_demand'
    ];

    keys.forEach(key => {
        const jobs = data[key];
        if (!Array.isArray(jobs)) return;
        for (let i = 0; i < jobs.length; i++) {
            const job = jobs[i];

            const {
                code, url, title, short_description, explanation, new_skills, existing_skills, interests, quality_index, scoring_index
            } = job;

            const newJob = {
                url,
                author: null,
                language: null,
                title,
                description: short_description,
                location: null,
                time: null,
                score: scoring_index,
                normalizedScore: quality_index,
                matchingSkills: existing_skills,
                missingSkills: new_skills,
            };
            processed.push(newJob);
        }
    });

    return processed;
}

function normalize(jobs){
    if (!Array.isArray(jobs)) return jobs;

    for (let i = 0; i < jobs.length; i++) {
        PropertiesUtils.normalizeProperties(jobs[i]);
    }
}

const jobs = {
    process,
    normalize,
}

module.exports = jobs;
const PropertiesUtils = require("../properties/utils");

function process(data, provider){
    var courses = null;
    if (provider == 'inokufu'){
        courses = processInokufu(data);
    } else if (provider == 'headai'){
        courses = processCompassHeadai(data);
    }
    return courses;
}

function normalize(courses){
    if (!Array.isArray(courses)) return courses;

    for (let i = 0; i < courses.length; i++) {
        PropertiesUtils.normalizeProperties(courses[i]);
    }
}

function processCompassHeadai(data){
    const processed = [];

    const keys = [
        'recommendations_based_on_extensive_skills',
        'recommendations_based_on_match',
        'recommendations_based_on_learning_paths',
        'recommendations_based_on_skills_demand',
        'recommendations_based_on_matching_skills'
    ];

    keys.forEach(key => {
        const courses = data[key];
        if (!Array.isArray(courses)) return;
        for (let i = 0; i < courses.length; i++) {
            const course = courses[i];
            const { 
                code , url, title, short_description, explanation, new_skills, existing_skills,
                interests, quality_index, scoring_index,
            } = course;
            const newCourse = {
                code,
                url,
                title,
                description: short_description,
                explanation,
                newSkills: new_skills,
                existingSkills: existing_skills,
                interests,
                score: scoring_index,
                normalizedScore: quality_index,
                language: null,
                organization: null,
                duration: null,
                price: null,
            }
            processed.push(newCourse);
        }
    });

    console.log(processed);

    return processed;
}

function processInokufu(data){
    if (!Array.isArray(data)) return null;
    const processed = [];
    
    for (let i = 0; i < data.length; i++) {
        const course = data[i];
        var { currency , value } = course.price || {};
        var price = null;
        if (typeof(currency) === 'string' && typeof(value) == 'number'){
            price = `${currency} ${value}`;
        }

        var { value , unit } = course.duration || {};
        var duration = null;
        if (typeof(value) === 'number' && typeof(unit) == 'string'){
            duration = `${value} ${unit}`;
        }

        const newCourse = {
            code: course.id,
            url: course.url,
            title: course.title,
            description: course.description,
            explanation: course,
            new_skills: [],
            existing_skills: [],
            interests: [],
            score: course.score,
            normalized_score: null,
            language: course.lang,
            organization: course.provider,
            duration: duration,
            price: price,
            note: course.note,
        }
        processed.push(newCourse);
    }
    return processed;
}

const courses = {
    process,
    normalize,
}

module.exports = courses;
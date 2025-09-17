const VALID_TYPES = [
    'dictionary', 'string', 'number', 'array', 'boolean',
]

function mergeProperties(properties, newValues){
    Object.assign(properties, newValues);
}

/**
 * This function is mainly used to remove default params that were overriden by custom params (Affects all Visualization constructor)
 * @param {*} dict 
 * @param {*} keys 
 * @returns 
 */
function removeDictionaryKeys(dict, keys){
    if (!Array.isArray(keys)) return;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        delete dict[key];
    }
}

function cleanDictionary(dict){
    return Object.fromEntries(
        Object.entries(dict).filter(([_, v]) => v != null)
    );
}

function mergeDictionaries(dict1, dict2){
    const merge = {};
    dict1 = cleanDictionary(dict1);
    dict2 = cleanDictionary(dict2);
    Object.assign(merge, dict1);
    Object.assign(merge, dict2);
    return merge;
}

function dictionaryChanged(obj1, obj2){
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    var keys = new Set([...keys1, ...keys2]);
    keys = [...keys];

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value1 = obj1[key];
        const value2 = obj2[key];
        if (value1 !== value2) return true;
    }
    return false;
}

function validateType(type, value){
    if (!VALID_TYPES.includes(type)) return true;
    switch (type) {
        case 'dictionary':
            const isArray = Array.isArray(value);
            const isObject = value?.constructor === Object;
            return !isArray && isObject;
        case 'array':
            return Array.isArray(value);
        case 'boolean':
        case 'number':
        case 'string':
            return (typeof(value) == type)
        default:
            return true;
    }
}

function validateArraySubType(subtype, array){
    for (let i = 0; i < array.length; i++) {
        var newValue = array[i];
        newValue = normalizePropertyValue(subtype,newValue);
        if (newValue == null) return false;
        if (!PropertiesUtils.validateType(subtype,newValue)) return false;
        array[i] = newValue;
    }
    return true;
}

function normalizeValue(type, value){
    const isString = typeof(value) === 'string';
    const isBoolean = typeof(value) === 'boolean';

    switch (type) {
        case 'number':
            if (isBoolean) return null; // Booleans are casted as 0 or 1 with the Number constructor
            value = Number(value);
            if (isNaN(value)) value = null;
            return value;
        case 'string':
            if (!isString) return null;
            return String(value);
        case 'boolean':
            if (isBoolean) return value;
            if (isString){
                value = value.toLowerCase();
                if (value === 'true') return true;
                if (value === 'false') return false;
                return null;
            }
            return null;
        case 'array':
            return normalizeToArray(value);
        default:
            return value;
    }
}

function normalizeProperties(props){
    if (props == null) return null;
    
    const keys = Object.keys(props);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = props[key];
        const newKey = normalizePropertyName(key);
        if (key == newKey) continue;

        delete props[key];
        props[newKey] = value;
    }

    return props;
}

function propertyNameToTitle(name){
    return name.replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase()).trim();
}

function normalizePropertyName(name){
    if (typeof(name) !== "string") return name;
    return toCamelCase(name);
}

function toCamelCase(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function normalizePropertyValue(type,value){
    const isValid = validateType(type,value);
    if (isValid) return value;

    switch (type) {
        case "array":
            return normalizeToArray(value);
        case "string":
            return "";
        case "dictionary":
            return {};
        case "number":
            value = Number.parseFloat(value)
            if (isNaN(value)) value = null;
            return value;
        default:
            return null;
    }
}

function normalizeToArray(value){
    const defaultValue = [];
    if (Array.isArray(value)){
        return value;
    } else if (typeof(value) == "string") {
        if (value.trim().length == 0) return defaultValue;
        var values = value.split(',');
        values = values.map(str => str.trim());
        return values;
    } else {
        return defaultValue;
    }
}

const PropertiesUtils = {
    VALID_TYPES,
    removeDictionaryKeys,
    cleanDictionary,
    mergeDictionaries,
    mergeProperties,
    dictionaryChanged,
    validateType,
    validateArraySubType,
    normalizeValue,
    normalizeProperties,
    propertyNameToTitle,
    normalizePropertyValue,
}

module.exports = PropertiesUtils;
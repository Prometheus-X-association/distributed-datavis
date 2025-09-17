const PropertiesUtils = require("./utils");

const skipFields = ['rules','This','customSetters','afterSetters'];

class Properties {
    constructor(rules){
        this.This = this;
        this.rules = {};
        this.addRules(rules);
        // Functions that replace default set process
        this.customSetters = {};
        // Functions to be executed after value is set
        this.afterSetters = {};

        const This = new Proxy(this, {
            get: (target, key)=>{
                return target[key];
            },
            set: (target, key, value)=>{
                if (skipFields.includes(key)) return true;
                value = this.normalizeValue(key,value);
                if (!target.ruleIsValid(key,value)) return true;
                // Prevents executing custom setter if value ha not been modified
                if (target[key] === value) return true;
                
                const customSetter = this.customSetters[key];
                const afterSetter = this.afterSetters[key];
                const ruleType = this.rules[key]?.type;

                var success = true;

                if (typeof(customSetter) == "function"){
                    success = (customSetter(value) == true);
                }  else if (ruleType == 'dictionary'){
                    this.#setterDictionary(key, value);
                } else if (ruleType == 'array'){
                    this.#setterArray(key, value);
                } else {
                    target[key] = value;
                }

                if (success && typeof(afterSetter) == "function"){
                    afterSetter(value);
                    return true;
                } else {
                    return true;
                }
            }
        });

        return This;
    }

    defineSetter(propertyName,setter){
        if (typeof(setter) !== 'function') return;
        this.customSetters[propertyName] = setter;
    }

    defineSetters(propToSetter){
        if (propToSetter == null) return;
        const props = Object.keys(propToSetter);
        props.forEach((prop)=>{
            this.defineSetter(prop, propToSetter[prop]);
        });
    }

    defineAfterSetter(propertyName,setter){
        if (typeof(setter) !== 'function') return;
        this.afterSetters[propertyName] = setter;
    }

    defineAfterSetters(propToSetter){
        if (propToSetter == null) return;
        const props = Object.keys(propToSetter);
        props.forEach((prop)=>{
            this.defineAfterSetter(prop, propToSetter[prop]);
        });
    }

    ruleIsValid(key, value){
        if (!this.rules.hasOwnProperty(key)) return true;
        const typeIsValid = this._validateRuleType(key,value);
        return typeIsValid === true;
        
    }

    normalizeValue(key,value){
        if (value === null || value === undefined) return null;
        const rule = this.rules[key];
        if (rule == null) return value;
        const ruleType = rule.type;
        return PropertiesUtils.normalizeValue(ruleType, value);
    }

    _validateRuleType(key,value){
        if (value === null || value === undefined) return false;
        const rule = this.rules[key];
        if (rule == null) return true;
        const type = rule.type;
        return PropertiesUtils.validateType(type,value);
    }

    addRules(rules){
        if (Array.isArray(rules)) return;
        if (typeof(rules) !== "object") return;
        this.rules = PropertiesUtils.mergeDictionaries(this.rules, rules);
        // Initialize certain values
        Object.keys(rules).forEach((prop)=>{
            const type = rules[prop].type;
            const currentValue = this[prop];
            // Initialize empty dictionaries
            if (type === 'dictionary' && currentValue == null) this[prop] = {};
        });
    }

    // This is used to bypass a custom setter function, to define an initial value without going through the setter
    initializeProperty(property, value){
        this.This[property] = value;
    }

    restartRules(){
        this.rules = {};
    }

    setProperties(newProps){
        const changes = {};
        newProps = PropertiesUtils.cleanDictionary(newProps);
        const propNames = Object.keys(newProps);
    
        for (let i = 0; i < propNames.length; i++) {
            const prop = propNames[i];
            var oldValue = this[prop];
            if (this.rules[prop]?.type === 'dictionary') oldValue = { ...oldValue };
            var newValue = newProps[prop];
            this[prop] = newValue;
            const changed = this.valueChanged(prop, oldValue, this[prop]);
            if (changed) changes[prop] = newValue;
        }
    
        return changes;
    }

    getProperties(){
        const properties = { ...this };
        delete properties.afterSetters;
        delete properties.customSetters;
        delete properties.This;
        delete properties.rules;
        return properties;
    }

    valueChanged(key, oldValue, newValue){
        const type = this.rules[key]?.type || 'string';
    
        if (type == 'array'){
            const changed = ( JSON.stringify(oldValue) !== JSON.stringify(newValue) );
            return changed;
        } else if (['number','boolean','string'].includes(type)){
            return (oldValue !== newValue);
        } else if (type == 'dictionary'){
            return PropertiesUtils.dictionaryChanged(oldValue, newValue);
        } else {
            console.log(`Error at valueChanged(${oldValue},${newValue},${type}) - Unsuported type`);
            return false;
        }
    }

    #setterDictionary(key,newDictionary){
        const dict = this[key];
        const keys = Object.keys(newDictionary);
        const subtype = this.rules[key]?.subtype;
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const newValue = newDictionary[key];
            if (newValue == null) continue;
            // If subtype is defined but value is not correct, skip it
            if (PropertiesUtils.VALID_TYPES.includes(subtype) && !PropertiesUtils.validateType(subtype,newValue)) continue;
            dict[key] = newValue;
        }
    }

    #setterArray(key,newArray){
        const subtype = this.rules[key]?.subtype;
        if (subtype != null){
            if (!PropertiesUtils.VALID_TYPES.includes(subtype)) return true;
            const isValid = PropertiesUtils.validateArraySubType(subtype, newArray);
            if (!isValid) return true;
        }

        this.initializeProperty(key,newArray);
        return true;
    }
}

module.exports = Properties;
function detectFormat(json){
    if (Array.isArray(json?.data) && Array.isArray(json?.info?.timeLabels)) return 'signals';
    if (Array.isArray(json?.visuals)) return 'rules';
    if (Array.isArray(json?.data?.nodes) && Array.isArray(json?.data?.edges)) return 'digitalTwin';
    return null;
}

const FormatUtils = {
    detectFormat,
};

module.exports = FormatUtils;
module.exports.config = {
    name: "wiki",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "Adi.0X",
    description: "Get information from Wikipedia in different languages",
    commandCategory: "Research",
    usages: "[language] [search query]\nExample: /wiki bangla Bangladesh",
    cooldowns: 1,
    dependencies: {
        "wikijs": ""
    }
};

module.exports.languages = {
    "en": {
        "missingInput": "Please specify both language and search query!",
        "returnNotFound": "Couldn't find any results for: %1",
        "invalidLanguage": "Unsupported language. Available options: %1",
        "usage": "Correct usage: /wiki [language] [query]\nExample: /wiki english Facebook"
    }
};

// Supported languages mapping
const languageMap = {
    'english': 'en',
    'en': 'en',
    'bangla': 'bn',
    'bn': 'bn',
    'hindi': 'hi',
    'hi': 'hi',
    'spanish': 'es',
    'es': 'es',
    'french': 'fr',
    'fr': 'fr'
};

module.exports.run = async ({ event, args, api, getText }) => {
    const wiki = (global.nodemodule["wikijs"]).default;
    const { threadID, messageID } = event;

    // Check for minimum arguments
    if (args.length < 2) {
        return api.sendMessage(getText("usage"), threadID, messageID);
    }

    // Extract language and query
    const [langInput, ...restArgs] = args;
    const query = restArgs.join(" ");
    const languageCode = languageMap[langInput.toLowerCase()];

    // Validate language
    if (!languageCode) {
        const availableLangs = Object.keys(languageMap).filter(k => k.length > 2);
        return api.sendMessage(
            getText("invalidLanguage", availableLangs.join(", ")),
            threadID,
            messageID
        );
    }

    // Set Wikipedia API URL
    const apiUrl = `https://${languageCode}.wikipedia.org/w/api.php`;

    try {
        const page = await wiki({ apiUrl }).page(query);
        const summary = await page.summary();
        
        // Send formatted response
        const response = `📖 Wikipedia (${languageCode.toUpperCase()}) Result:\n\n${summary}`;
        return api.sendMessage(response, threadID, messageID);
        
    } catch (error) {
        return api.sendMessage(
            getText("returnNotFound", query),
            threadID,
            messageID
        );
    }
};

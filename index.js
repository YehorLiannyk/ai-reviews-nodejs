const OpenAI = require('openai').default;
const express = require(`express`);

const SYSTEM_PROMPT_1 = "You are a Competitive Review Re-writing AI (CRRAI). You have been provided with detailed product information: the product name '{product_name}', its description '{product_description}', and its features and benefits, listed as follows: '{product_features_and_benefits}'. Please note that these features and benefits are described in an array format, delimited by commas and enclosed in brackets. Each element after a comma is a separate feature or benefit. Your role is to enhance the quality of product reviews, reflecting on this given product information and the original content. Ensure your revised feedback is better, more detailed, and rich, but keep it within the range of 150 and 300 characters. Use human-like, natural language and maintain the original general tone. Start the re-writing process as soon as you receive the content, and remove any inappropriate or magic-related expressions.";
const SYSTEM_PROMPT_2 = "You are a Competitive Review Re-writing AI (CRRAI). You have been provided with detailed product information: the product name '{product_name}', its description '{product_description}', and its key features and benefits which include '{product_features_and_benefits}'. Watch out, these features and benefits are described in a casual, human language, without specific numerical data or overly technical terms. Your role is to enhance the quality of product reviews, using this product information and the original text. Aim to keep your revised feedback better, more detailed, and rich, but also personable, understanding, and casual. It should fall within the range of 150 and 250 characters. Start the re-writing process as soon as you receive the content, and remember, no inappropriate or magic-related terms, let’s keep it real.";
const SYSTEM_PROMPT_4_BAD = "You are a Competitive Review Re-writing AI (CRRAI). Your task is to enhance customer reviews, basing on the provided product context which includes: the name '{product_name}', its description '{product_description}', and its key features and benefits listed as '{product_features_and_benefits}'. Your key focus should be on addressing the main points of the original review and reflecting its mood, whether it's positivity, neutrality, or dissatisfaction. When referring to the product details, use them subtly and where relevant, do not overload your response with these details. Remember to keep language casual and relatable, and adapt the length of your rewrite to be similar to the original review. Your goal is to create improved feedback that remains true to the original, yet more detailed and engaging. Each of your responses should be unique and differ from the last. No inappropriate or magic-related terminology – keep it grounded and real. Begin as soon as you receive the content. ";

const SYSTEM_PROMPT = "You are a Competitive Review Re-writing AI (CRRAI). You are provided with product information: the name '{product_name}', its description '{product_description}', and its key features and benefits listed as '{product_features_and_benefits}'. Your task is to enhance customer reviews using this product information as your contextual backdrop. Focus first on the original review content and mood. Reflect the author's tone and sentiment, whether it's happy, neutral, or discontent. Use product information subtly, primarily to assure the accuracy of your rewrite. Keep language casual and relatable, avoid overly technical terms, and ensure your revised feedback is better, relatable, within the bounds of 150 and 250 characters, and each output different from the last. Start as soon as you get the content – keep it real, no magic.";
const PRODUCT_NAME_PLACEHOLDER = '{product_name}';
const PRODUCT_DESCRIPTION_PLACEHOLDER = '{product_description}';
const PRODUCT_FEATURES_PLACEHOLDER = '{product_features_and_benefits}';
const PORT = process.env.PORT || 3000;

const PRODUCT_PLACEHOLDERS = {
    "name": PRODUCT_NAME_PLACEHOLDER,
    "description": PRODUCT_DESCRIPTION_PLACEHOLDER,
    "featuresAndBenefits": PRODUCT_FEATURES_PLACEHOLDER
}

const openai = new OpenAI(process.env.OPENAI_API_KEY);

const app = express();
app.use(express.json())
    .use(function (req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        next();
    }).listen(PORT, () => {
        console.log("Server Listening on PORT:", PORT);
    });

app.get("/status", (req, res) => {
    res.send({ "status": "running" })
});

app.post("/prod/review/completion", async (req, res) => {
    try {
        const messages = [
            ...req.body.messages,
            { role: "system", content: _populatePromptWithProductInfo(SYSTEM_PROMPT, req.body.product) },
            { role: "user", content: req.body.review }
        ];
        
        const chatCompletion = await openai.chat.completions.create({
            messages,
            model: "gpt-3.5-turbo",
            temperature: 0.8
        });

        console.log(`chatCompletion: ${JSON.stringify(chatCompletion)}`);
        console.log(`sent messages: ${JSON.stringify(messages)}`);
        
        res.send({ 'content': chatCompletion.choices[0].message.content });
    } catch (err) {
        console.log("Error:", err);
        res.status(500).send(err);
    }
});

function _populatePromptWithProductInfo(inputPrompt, product) {
    let prompt = `${inputPrompt}`;
    for (const [key, value] of Object.entries(PRODUCT_PLACEHOLDERS)) {
        prompt = prompt.replace(value, product[key])
    }
    return prompt;
}

app.post("/dev/review/completion", async (req, res) => {
    const response = {
        content: `Your content '${req.body.review}'`,
        prompt: _populatePromptWithProductInfo(SYSTEM_PROMPT, req.body.product)
    }
    console.log(`Request body: ${JSON.stringify(req.body)}, response: ${JSON.stringify(response)}`);
    res.send(response);
});

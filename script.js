const aiBuzzwords = [
    "delve", "unlock", "unleash", "cutting-edge", "revolutionize", 
    "game-changer", "seamless", "synergy", "leverage", "elevate", 
    "empower", "next-gen", "innovative", "transform", "tapestry", "realm"
];

function loadSample() {
    document.getElementById("copyInput").value = 
        "Welcome to Acme Corp. We leverage cutting-edge, innovative technology to unlock seamless synergy and revolutionize your business workflow. Empower your team today!";
}

async function analyzeCopy() {
    const text = document.getElementById("copyInput").value.trim();
    const apiKey = document.getElementById("apiKeyInput").value.trim();
    const btn = document.getElementById("analyzeBtn");

    if (!text) {
        alert("Please paste some website copy first!");
        return;
    }

    btn.innerText = "Analyzing...";
    btn.disabled = true;

    if (apiKey) {
        await analyzeWithGemini(text, apiKey);
    } else {
        analyzeLocally(text);
    }

    btn.innerText = "Grade My Copy";
    btn.disabled = false;
}

// Built-in Fast Rule-Based Analyzer (Works offline/free without API key)
function analyzeLocally(text) {
    const lowerText = text.toLowerCase();
    const foundBuzzwords = aiBuzzwords.filter(word => lowerText.includes(word));
    
    let score = 85;
    score -= foundBuzzwords.length * 10;

    const tips = [];

    if (foundBuzzwords.length > 0) {
        tips.push(`Remove generic AI words (${foundBuzzwords.join(", ")}). Replace them with specific results your customer gets.`);
    } else {
        tips.push("Great job avoiding overused AI buzzwords!");
    }

    if (!/\d+%|\$\d+|\d+x|\d+ hours|\d+ days/i.test(text)) {
        score -= 15;
        tips.push("Add concrete numbers or proof (e.g., 'Save 5 hours a week' or 'Increase sales by 30%') to build instant trust.");
    }

    if (!/you|your/i.test(text)) {
        score -= 10;
        tips.push("Focus more on the customer. Use words like 'You' and 'Your' instead of talking only about your company.");
    }

    if (text.split(" ").length < 8) {
        score -= 10;
        tips.push("Your copy is too short. Clearly explain what you do, who it is for, and the main benefit.");
    }

    score = Math.max(15, Math.min(98, score));
    displayResults(score, foundBuzzwords, tips);
}

// Real AI Analysis using Google Gemini API
async function analyzeWithGemini(text, apiKey) {
    try {
        const prompt = `Act as an expert conversion copywriter. Analyze this landing page copy: "${text}". 
        Respond ONLY in valid JSON format with three keys:
        "score": (number between 10 and 100),
        "buzzwords": (array of weak or generic words found in the text),
        "tips": (array of 3 short, actionable sentences to improve conversions)`;

        const response = await fetch(`https://googleapis.com{apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        let rawText = data.candidates[0].content.parts[0].text;
        rawText = rawText.replace(/```json|```/g, "").trim();
        const result = JSON.parse(rawText);

        displayResults(result.score, result.buzzwords, result.tips);
    } catch (error) {
        alert("API Key error or limit reached. Switching to built-in analyzer.");
        analyzeLocally(text);
    }
}

function displayResults(score, buzzwords, tips) {
    const resultBox = document.getElementById("resultBox");
    const scoreDisplay = document.getElementById("scoreDisplay");
    const verdictText = document.getElementById("verdictText");
    const buzzwordsList = document.getElementById("buzzwordsList");
    const tipsList = document.getElementById("tipsList");

    resultBox.classList.remove("hidden");
    scoreDisplay.innerText = score;

    if (score >= 80) {
        verdictText.innerText = "Strong Copy! Ready to convert visitors.";
        scoreDisplay.className = "text-3xl font-extrabold text-emerald-400";
    } else if (score >= 55) {
        verdictText.innerText = "Average Copy. Needs clearer value proposition.";
        scoreDisplay.className = "text-3xl font-extrabold text-amber-400";
    } else {
        verdictText.innerText = "Weak Copy! Sounds too generic and robotic.";
        scoreDisplay.className = "text-3xl font-extrabold text-rose-400";
    }

    buzzwordsList.innerHTML = "";
    if (buzzwords.length === 0) {
        buzzwordsList.innerHTML = `<span class="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full">None detected! Clean writing.</span>`;
    } else {
        buzzwords.forEach(word => {
            buzzwordsList.innerHTML += `<span class="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full">${word}</span>`;
        });
    }

    tipsList.innerHTML = "";
    tips.forEach(tip => {
        tipsList.innerHTML += `<li>${tip}</li>`;
    });
}

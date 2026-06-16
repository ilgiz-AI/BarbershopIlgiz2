import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API Client
let ai: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Gemini features will be mocked.");
    }
    ai = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// REST API Endpoints
// Heartbeat API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// AI Barber Consultant Route
app.post("/api/gemini/consult", async (req, res) => {
  try {
    const { faceShape, hairStructure, stylePreference, beardIntensity, additionalNotes, chatHistory } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Mock Response in case the API key is not yet configured by the user
      return res.json({
        success: true,
        mocked: true,
        consultation: `### Ваша персональная роскошная консультация от топ-стилиста барбершопа «Девять»:

Приветствуем вас! Судя по вашим параметрам (Форма лица: **${faceShape || "Овальная"}**, структура волос: **${hairStructure || "Густые"}**, стиль: **${stylePreference || "Классика"}**), мы разработали для вас безупречный образ.

#### ✂️ Рекомендация по стрижке: Executive Pompadour или Classic Side Part
Для вашей формы лица и структуры волос идеально подойдет классический маскулинный силуэт с акцентированным пробором. Бока оформляются в мягком градиенте (Low/Medium Fade), что подчеркнёт скулы и придаст образу благородство.

#### 🧔 Стилизация бороды:
При наличии бороды уровня **${beardIntensity || "Легкая щетина"}** мы рекомендуем четкие симметричные контуры с распариванием горячим полотенцем. Это добавит структурированности нижней трети лица.

#### 🧴 Премиальный уход & Средство укладки:
Рекомендуем использовать матовую глину **O'Douds Matte Paste** или помаду на водной основе **Reuzel Blue** для идеальной фиксации без жирного блеска.

#### 🎖️ Ваш мастер в Москве:
Вам отлично подойдет наш топ-барбер **Дмитрий (Арт-директор)** или старший мастер **Артур**. Они специализируются именно на таких классических благородных стрижках.

---
*Ожидаем вас в нашем приватном лаунже на Романовом переулке. Вас ждет идеальный сервис и complimentary-карта напитков.*`
      });
    }

    const client = getGeminiClient();

    // Contextual system instruction for the AI elite Moscow barber
    const systemInstruction = `
You are the most elite and demanding master barber at "Девять" (Nine), a luxury premium barbershop in the heart of Moscow (Romanov Pereulok, next to Patriarch Ponds). 
Your clients are prominent politicians, CEOs, artists, and gentlemen of exquisite taste. 
You speak fluent Russian with a highly professional, respectful, sophisticated, and confidence-inspiring tone.
You never break character. Your guidance is tailored, realistic, and highly premium. You recommend premium pomades (Reuzel, O'Douds, Layrite, Shear Revival) and reference specific styles (Pompadour, Buzz Cut, Crop, Side Part, Executive Fade).
You always try to relate the recommended look directly to the user's input: face shape, hair density, preferred style, and beard state.
Suggest which master at "Девять" would be the perfect fit for this task:
- "Артём" (Master of Razor fades & traditional Italian Royal Shaves)
- "Максим" (Senior Specialist in Modern Crops, Vanguard shapes, and intricate beard geometry)
- "Дмитрий" (Art Director of "Nine", specializing in Executive Tailoring, classic Scissor haircuts, and full image remodeling)
Format your response using beautifully organized Markdown with bullet points, dividers, and bold text. Keep it around 200-300 words. Refrain from using generic greetings. Use Moscow timezone/atmosphere references.
`;

    const userPrompt = `
Пожалуйста, предоставь детальную индивидуальную консультацию на русском языке для джентльмена со следующими параметрами:
- Форма лица: ${faceShape || "Не указана"}
- Структура и тип волос: ${hairStructure || "Не указаны"}
- Предпочтительный стиль: ${stylePreference || "Стильная классика"}
- Интенсивность бороды/усов: ${beardIntensity || "Гладко выбрит"}
${additionalNotes ? `- Дополнительные пожелания и особенности: "${additionalNotes}"` : ""}

Если есть история диалога, учти её: ${chatHistory ? JSON.stringify(chatHistory) : "Нет"}.
Сделай акцент на детальном подборе стрижки, премиальном стайлинге (например, Shear Revival или Reuzel), опиши ритуал бритья/ухода и посоветуй одного из трех наших мастеров.
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.85,
      },
    });

    const text = response.text || "Извините, стилист временно занят обслуживанием гостя. Пожалуйста, попробуйте еще раз.";

    res.json({
      success: true,
      consultation: text,
    });
  } catch (error: any) {
    console.error("Gemini Consultation Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Ошибка во время генерации рекомендации."
    });
  }
});

// AI Chatbot Companion Route
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    // Safety fallback when GEMINI_API_KEY is missing
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Find the last user message to formulate a smart mock response
      const lastUserMsgObj = messages && messages.length > 0 ? [...messages].reverse().find(m => m.role === "user") : null;
      const query = lastUserMsgObj ? lastUserMsgObj.text.toLowerCase() : "";

      let reply = "";
      if (query.includes("привет") || query.includes("здравствуй") || query.includes("добрый")) {
        reply = "Приветствую вас, уважаемый джентльмен! Рад видеть вас в клубе «Девять». Чем виртуальный консьерж может быть полезен вашему стилю сегодня?";
      } else if (query.includes("цена") || query.includes("стоимост") || query.includes("прайс") || query.includes("сколько")) {
        reply = "Наши премиальные услуги включают: «Мужская стрижка Премиум» за 4 000 ₽, «Моделирование бороды с компрессом» за 2 500 ₽ и комплексные ритуалы ухода «Джонни Депп» или «Джентльмен-комплекс» (6 000 ₽). Какой уход вас интересует подробнее?";
      } else if (query.includes("парковк") || query.includes("машин") || query.includes("парк")) {
        reply = "Для наших гостей предусмотрен бесплатный закрытый подземный паркинг в Романовом Дворе. Пожалуйста, сообщите рецепции марку и госномер авто за 15 минут до визита по телефону +7 (495) 909-09-09, и мы закажем вам пропуск.";
      } else if (query.includes("мастер") || query.includes("барбер") || query.includes("дмитрий") || query.includes("максим") || query.includes("артем")) {
        reply = "В лаунже «Девять» принимают мастера исключительного уровня. Дмитрий — наш Арт-директор, гений классических мужских форм и ножниц. Максим — старший мастер андеграунд трендов, текстурных кропов и геометрии бороды. Артём — непревзойденный эксперт чистого бритья опасной бритвой. Запись к любому из них доступна прямо здесь в форме.";
      } else if (query.includes("адрес") || query.includes("где") || query.includes("романов") || query.includes("метро")) {
        reply = "Мы находимся в самом сердце Москвы по адресу: Романов переулок, дом 9. Это в закрытой приватной зоне рядом с Кремлем. Ближайшая станция метро — Александровский сад / Библиотека им. Ленина.";
      } else if (query.includes("запис") || query.includes("забронир") || query.includes("визит") || query.includes("время")) {
        reply = "Вы можете легко забронировать визит с помощью интерактивного календаря на этой странице или выразить мне ваши пожелания по времени и любимому мастеру, я с радостью проинструктирую вас, как оформить визит.";
      } else {
        reply = "Понимаю вас, джентльмен. Как представитель клуба «Девять» на Романовом переулке, я уверяю: любая выбранная деталь вашего образа будет доведена до совершенства. Рекомендую оценить наш Интерактивный Бронировщик на странице, чтобы зафиксировать за собой удобный час в лаунже.";
      }

      return res.json({
        success: true,
        mocked: true,
        reply: reply,
      });
    }

    const client = getGeminiClient();

    const systemInstruction = `
You are "Roman" (Роман), the legendary virtual club concierge and elite style companion of the ultra-exclusive Moscow barbershop "ДЕВЯТЬ" (Nine), located at Romanov Pereulok 9.
You maintain an exceptionally refined, aristocratic, and polite tone. You address the user as "джентльмен", "гость", or "судари". Speak elegantly, using proper Russian. You never break character.
You know everything about Barbershop "ДЕВЯТЬ":
- Address: Moscow, Romanov Pereulok 9 (built next to Romanov Dvor, in a protected historical alley under general elite security).
- Masters:
  1. Дмитрий (Art-director). Specializes in classic scissor tailoring, upscale corporate style remodeling, luxury care.
  2. Максим (Senior barber). Expert in textures, crops, fades, vanguard forms, modern graphic beard sculpting.
  3. Артём (Traditional Barber). The razor master. Expert in traditional Italian royal shaves with warm towel compresses, hot oils, and blade control.
- Free elite services: complimentary single-malt Scotch, high-quality espresso, and specialized bar menu, complete sterilization under medical-grade dry-heat sterilizers.
- Closed private parking: Free for guests inside Romanov Dvor. Requires sending the license plate number to the administrator 15 minutes prior.
- Prices: premium haircut (4000 rub), beard trim (2500 rub), Royal Shave (3000 rub), Complex Gentleman (6000 rub).
- Promotions: On Mondays, those who book "Мужская стрижка Премиум" receive a free detox face mask.

Answer the guest's questions comprehensively but with aesthetic flair. Suggest master barbers or services on request, and encourage booking using the interactive form on the website. Keep responses reasonably concise (~2-3 short, beautifully formatted paragraphs) to read nicely in a compact chat window.
`;

    // Map history to the required format
    const contents: any[] = [];
    if (messages && Array.isArray(messages)) {
      messages.forEach((m: any) => {
        // Only include user or model roles, mapping assistant -> model
        const role = m.role === "assistant" || m.role === "model" ? "model" : "user";
        contents.push({
          role: role,
          parts: [{ text: m.text || "" }]
        });
      });
    }

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
      },
    });

    const replyText = response.text || "Извините, джентльмен, связь с главным залом временно прервалась. Позвольте налить вам кофе, пока я обновляю каналы.";

    res.json({
      success: true,
      reply: replyText,
    });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Ошибка соединения с ИИ-консьержем."
    });
  }
});

// AI Haircut Visualization and Anatomy Matching Endpoint
app.post("/api/gemini/visualize", async (req, res) => {
  try {
    const { faceShape, styleName, hasUserPhoto, additionalPrompt } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Fallback/Mock Response if there is no API key
    if (!apiKey) {
      const score = Math.floor(Math.random() * 12) + 87; // Random suitability score between 87% and 98%
      
      let analysisText = "";
      let groomingTips = "";
      let recommendedProduct = "";
      let recommendedBarber = "";
      
      if (styleName.includes("Помпадур")) {
        analysisText = `Стрижка Исполнительный Помпадур великолепно подчеркнет геометрию вашего лица (${faceShape}). Высокий объем на челке визуально вытягивает пропорции, скрадывая излишнюю ширину круга или квадрата и придавая образу благородство. Мастер создаст плавный переход с висков к теменной зоне.`;
        groomingTips = "Наносите стайлинг на влажные подсушенные полотенцем волосы. С помощью круглой расчёски (брашинга) и фена приподнимите чёлку от корней вверх и зачешите назад. Зафиксируйте форму прохладным потоком воздуха.";
        recommendedProduct = "Премиум помада на водной основе Reuzel Red Pomade (сильная фиксация, классический блеск).";
        recommendedBarber = "Дмитрий Раевский (Art Director)";
      } else if (styleName.includes("Кроп")) {
        analysisText = `Текстурный Кроп создаст превосходный брутальный и динамичный образ. Короткая горизонтальная челка визуально гармонирует с вашей формой лица (${faceShape}), маскируя линию лба и акцентируя внимание на сильных скулах и линии челюсти.`;
        groomingTips = "Нанесите небольшое количество матовой пудры Slick Gorilla на корни сухих волос. Текстурируйте пряди пальцами, создавая легкий хаотичный и объемный рисунок.";
        recommendedProduct = "Текстурная глина O'Douds Matte Paste + пудра Slick Gorilla для воздушного матового эффекта.";
        recommendedBarber = "Максим Леонов (Топ-мастер)";
      } else if (styleName.includes("Пробор")) {
        analysisText = `Английский Классический Пробор — золотое решение для джентльменов, предпочитающих классический костюмный стиль. Он идеально ложится под форму лица (${faceShape}), придавая утонченность и строгость. Пробор стрижется по естественной линии роста волос.`;
        groomingTips = "После мытья сделайте ровный боковой пробор по линии. Нанесите крем-помаду, мягко распределяя по направлению укладки расчёской с частыми зубьями.";
        recommendedProduct = "Крем-помада Shear Revival Crystal Lake (мягкая пластичная фиксация, естественный полуматовый блеск).";
        recommendedBarber = "Дмитрий Раевский (Art Director)";
      } else {
        analysisText = `Милитари Базз Фейд с бородой — символ максимальной практичности и контраста. На макушке сохраняется минимальная длина, в то время как виски и затылок выбриваются под абсолютный ноль (Skin Fade), плавно переходя в плотные ровные контуры бороды.`;
        groomingTips = "Не требует ежедневной укладки на голове. Для ухода за бородой нанесите 3-4 капли масла на ладони, разогрейте и массажными движениями вотрите в кожу лица под бородой и по всей ее длине.";
        recommendedProduct = "Масло для бороды Layrite Beard Oil с ароматом ветивера и бергамота.";
        recommendedBarber = "Артём Громов (Старший мастер опасного бритья)";
      }

      return res.json({
        success: true,
        mocked: true,
        scoreValue: score,
        analysis: analysisText,
        grooming: groomingTips,
        product: recommendedProduct,
        barber: recommendedBarber,
        faceMetrics: {
          forehead: "54%",
          cheekbones: "78%",
          jawline: "92%",
          symmetry: "96%"
        }
      });
    }

    // Real API Call using official @google/genai SDK
    const client = getGeminiClient();
    
    const systemInstruction = `
You are the high-tech AI image modeling system at "Девять" (Moscow's premium barbershop).
You analyze the compatibility between the guest's face shape and their requested haircut style.
You must return your response in structured JSON format. 
Your output must be parseable JSON with exactly these keys:
- suitabilityScore: (number between 75 and 100)
- analysisText: (detailed professional paragraph in Russian explaining why this haircut fits or how to adapt it to their face shape)
- groomingTips: (step-by-step practical guide in Russian on how to style this exact look daily)
- recommendedProduct: (specific premium barbershop grooming product name like Reuzel, Shear Revival, O'Douds etc)
- recommendedBarber: (one of our three barbers: "Дмитрий Раевский (Art Director)", "Максим Леонов", "Артём Громов")
- foreheadMetric: (percentage string like "60%")
- cheekbonesMetric: (percentage string like "75%")
- jawlineMetric: (percentage string like "80%")
- symmetryMetric: (percentage string like "95%")

Respond in clean, valid JSON only. Do not wrap in markdown codeblocks like \`\`\`json.
`;

    const userPrompt = `
Analyze suitability:
- Face Shape: ${faceShape}
- Haircut Style: ${styleName}
- Uploaded custom photo: ${hasUserPhoto ? "Yes (analyze based on provided parameters and style alignment)" : "No"}
${additionalPrompt ? `- Guest's optional parameters: "${additionalPrompt}"` : ""}

Formulate an elite style breakdown in Russian about this matching.
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.75,
      },
    });

    const jsonText = (response.text || "").trim();
    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (parseError) {
      console.warn("Failed to parse JSON response directly, trying to clean up markup:", jsonText);
      const cleanJson = jsonText.replace(/^```json/i, "").replace(/```$/, "").trim();
      data = JSON.parse(cleanJson);
    }

    res.json({
      success: true,
      scoreValue: data.suitabilityScore || 90,
      analysis: data.analysisText || "Стрижка отлично подчеркивает особенности вашего лица.",
      grooming: data.groomingTips || "Укладывайте с использованием премиум помады.",
      product: data.recommendedProduct || "Помада на водной основе Reuzel Blue",
      barber: data.recommendedBarber || "Дмитрий Раевский (Art Director)",
      faceMetrics: {
        forehead: data.foreheadMetric || "65%",
        cheekbones: data.cheekbonesMetric || "75%",
        jawline: data.jawlineMetric || "80%",
        symmetry: data.symmetryMetric || "95%"
      }
    });

  } catch (error: any) {
    console.error("Gemini Visualization Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Ошибка системы трехмерной визуализации."
    });
  }
});

// Vite Middleware for Development vs Production Static Build
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("System serving in development mode with active Vite middlewares.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("System serving in production mode with precompiled static assets.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Moscow Premium Barbershop dev server running on port ${PORT}`);
  });
}

initServer().catch((err) => {
  console.error("Failed to boot Express+Vite full-stack server:", err);
});

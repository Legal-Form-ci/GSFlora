import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  type: "course" | "assignment" | "quiz";
  topic: string;
  description?: string;
  level: string;
  subject: string;
  country?: string;
  schoolSystem?: string;
  className?: string;
  teacherName?: string;
  schoolName?: string;
  difficulty?: string;
  duration?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: GenerateRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { type, topic, description, level, subject, country, schoolSystem, className, teacherName, schoolName, difficulty } = requestData;

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "course") {
      systemPrompt = `Tu es un expert pédagogique spécialisé dans la création de cours pour le système éducatif ${schoolSystem || "francophone africain"} en ${country || "Côte d'Ivoire"}. 
Tu crées des cours structurés, professionnels et adaptés au niveau ${level}.

Le cours doit inclure:
1. TITRE - Un titre clair et accrocheur
2. OBJECTIFS PÉDAGOGIQUES - 3-5 objectifs clairs
3. PRÉ-REQUIS - Ce que l'élève doit savoir avant
4. INTRODUCTION - Mise en contexte du sujet (2-3 paragraphes)
5. DÉVELOPPEMENT - Le contenu principal avec:
   - Plusieurs parties numérotées (I, II, III...)
   - Des sous-parties (A, B, C...)
   - Des définitions claires
   - Des exemples concrets
   - Des illustrations/schémas décrits
6. RÉSUMÉ - Points clés à retenir
7. EXERCICES D'APPLICATION - 5-10 exercices variés avec niveaux de difficulté
8. BIBLIOGRAPHIE/RESSOURCES - Sources recommandées

Format le contenu en Markdown avec une structure claire. Utilise des tableaux quand nécessaire.`;

      userPrompt = `Crée un cours complet sur le sujet suivant:
- Matière: ${subject}
- Thème: ${topic}
- Niveau/Classe: ${level}${className ? ` (${className})` : ""}
- Pays: ${country || "Côte d'Ivoire"}
- Système scolaire: ${schoolSystem || "Système éducatif ivoirien"}
${description ? `- Description additionnelle: ${description}` : ""}
${difficulty ? `- Niveau de difficulté: ${difficulty}` : ""}

Génère un cours professionnel, complet et adapté au contexte local.`;

    } else if (type === "assignment") {
      systemPrompt = `Tu es un expert pédagogique spécialisé dans la création de devoirs pour le système éducatif ${schoolSystem || "francophone africain"} en ${country || "Côte d'Ivoire"}.
Tu crées des devoirs structurés, professionnels et adaptés au niveau ${level}.

Le devoir doit inclure:
1. EN-TÊTE avec:
   - Nom de l'établissement
   - Année scolaire
   - Classe
   - Matière
   - Date et durée du devoir
   - Enseignant
   
2. CONSIGNES GÉNÉRALES

3. EXERCICES avec:
   - Numérotation claire
   - Barème de notation
   - Différents niveaux de difficulté
   - Un mélange de questions:
     * Questions de cours
     * Exercices d'application
     * Problèmes de réflexion

4. CORRIGÉ SUGGÉRÉ (optionnel)

Format le contenu en Markdown avec une structure claire.`;

      userPrompt = `Crée un devoir complet sur le sujet suivant:
- Matière: ${subject}
- Thème: ${topic}
- Niveau/Classe: ${level}${className ? ` (${className})` : ""}
- Établissement: ${schoolName || "Groupe Scolaire Flora"}
- Enseignant: ${teacherName || ""}
- Pays: ${country || "Côte d'Ivoire"}
${description ? `- Description additionnelle: ${description}` : ""}
${difficulty ? `- Niveau de difficulté: ${difficulty}` : ""}

Génère un devoir professionnel, avec barème, adapté au contexte local.`;

    } else if (type === "quiz") {
      systemPrompt = `Tu es un expert pédagogique spécialisé dans la création de quiz interactifs pour le système éducatif ${schoolSystem || "francophone africain"}.

Génère un quiz avec les types de questions suivants:
- Questions à choix multiples (QCM) avec 4 options
- Questions Vrai/Faux
- Questions à réponse courte

Pour chaque question, fournis:
- Le texte de la question
- Les options (pour QCM)
- La bonne réponse
- Une explication

Retourne le résultat en JSON avec ce format:
{
  "title": "Titre du quiz",
  "description": "Description",
  "questions": [
    {
      "type": "mcq" | "true_false" | "short_answer",
      "question": "Texte de la question",
      "options": ["A", "B", "C", "D"] (pour QCM),
      "correct_answer": "La bonne réponse",
      "explanation": "Explication",
      "points": 2
    }
  ]
}`;

      userPrompt = `Crée un quiz de 10-15 questions sur:
- Matière: ${subject}
- Thème: ${topic}
- Niveau/Classe: ${level}
${description ? `- Contexte: ${description}` : ""}
${difficulty ? `- Difficulté: ${difficulty}` : ""}

Mélange les types de questions pour un quiz engageant.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, veuillez réessayer plus tard." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits insuffisants, veuillez recharger votre compte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI course generator error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

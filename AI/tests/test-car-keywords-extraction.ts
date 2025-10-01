#!/usr/bin/env bun
/**
 * LLM Model Testing Script for Car Keywords Extraction
 *
 * This script tests various LLM models for their ability to extract structured keywords
 * from natural language car search queries. It measures accuracy, speed, and cost.
 *
 * Usage: bun run scripts/llm-tests/test-car-keywords-extraction.ts
 */

import type { KeywordsExtractorResult } from "../../src/lib/pipeline/indexer/types";
import type {
    LLMModelConfig,
    LLMProviderConfig,
    LLMUseCaseConfig,
} from "../../src/lib/types/config";
import { KeywordsExtractor } from "../../src/pipeline/transformer/keywords-extractor";
import type { TestCase } from "./kit/interfaces";
import { calculateTokenCost } from "./kit/llm-providers-pricing";
import { runAllTests } from "./kit/run-tests";

// LLM model configurations to test
const LLM_MODELS_TO_TEST: Array<{ config: LLMUseCaseConfig }> = [
    {
        config: {
            provider: {
                name: "inception",
                apiKey: process.env.INCEPTION_API_KEY || "test-api-key",
            } as LLMProviderConfig,
            model: {
                name: "mercury",
                maxTokens: 512,
            } as LLMModelConfig,
        },
    },
    {
        config: {
            provider: {
                name: "vertexai",
            } as LLMProviderConfig,
            model: {
                name: "gemini-2.5-flash",
                maxTokens: 512,
                thinkingBudget: 0,
                location: "europe-west2",
            } as LLMModelConfig,
        },
    },
    // ...(Object.keys(PROVIDERS_MODELS_COSTS.openrouter).map((modelName) => ({
    //     config: {
    //         provider: {
    //             name: "openrouter",
    //             apiKey: process.env.OPENROUTER_API_KEY || "test-key",
    //         } as LLMProviderConfig,
    //         model: {
    //             name: modelName,
    //             maxTokens: 512,
    //         } as LLMModelConfig,
    //     }
    // }))),
    // {
    //     config: {
    //         provider: {
    //             name: "openrouter",
    //             apiKey: process.env.OPENROUTER_API_KEY || "test-key",
    //         } as LLMProviderConfig,
    //         model: {
    //             name: "qwen/qwen3-next-80b-a3b-instruct",
    //             maxTokens: 512,
    //         } as LLMModelConfig,
    //     },
    // },
    // {
    //     config: {
    //         provider: {
    //             name: "openrouter",
    //             apiKey: process.env.OPENROUTER_API_KEY || "test-key",
    //         } as LLMProviderConfig,
    //         model: {
    //             name: "meta-llama/llama-4-maverick",
    //             maxTokens: 512,
    //         } as LLMModelConfig,
    //     },
    // },
    // {
    //     config: {
    //         provider: {
    //             name: "openai",
    //             apiKey: process.env.OPENAI_API_KEY || "test-key",
    //         } as LLMProviderConfig,
    //         model: {
    //             name: "gpt-4o-mini",
    //         } as LLMModelConfig,
    //     },
    // },
    // {
    //     config: {
    //         provider: {
    //             name: "groq",
    //             apiKey: process.env.GROQ_API_KEY || "test-key",
    //         } as LLMProviderConfig,
    //         model: {
    //             name: "openai/gpt-oss-120b",
    //         } as LLMModelConfig,
    //     },
    // },
    // {
    //     config: {
    //         provider: {
    //             name: "groq",
    //             apiKey: process.env.GROQ_API_KEY || "test-key",
    //         } as LLMProviderConfig,
    //         model: {
    //             name: "openai/gpt-oss-20b",
    //         } as LLMModelConfig,
    //     },
    // },
    // {
    //     config: {
    //         provider: {
    //             name: "groq",
    //             apiKey: process.env.GROQ_API_KEY || "test-key",
    //         } as LLMProviderConfig,
    //         model: {
    //             name: "llama-3.1-8b-instant",
    //         } as LLMModelConfig,
    //     },
    // },
    // {
    //     config: {
    //         provider: {
    //             name: "groq",
    //             apiKey: process.env.GROQ_API_KEY || "test-key",
    //         } as LLMProviderConfig,
    //         model: {
    //             name: "llama-3.3-70b-versatile",
    //         } as LLMModelConfig,
    //     },
    // },
    // {
    //     config: {
    //         provider: {
    //             name: "fireworks",
    //             apiKey: process.env.FIREWORKS_API_KEY || "test-key",
    //         } as LLMProviderConfig,
    //         model: {
    //             name: "accounts/fireworks/models/llama4-maverick-instruct-basic",
    //         } as LLMModelConfig,
    //     },
    // },
    // {
    //     config: {
    //         provider: {
    //             name: "fireworks",
    //             apiKey: process.env.FIREWORKS_API_KEY || "test-key",
    //         } as LLMProviderConfig,
    //         model: {
    //             name: "accounts/fireworks/models/kimi-k2-instruct-0905",
    //         } as LLMModelConfig,
    //     },
    // },
    // {
    //     config: {
    //         provider: {
    //             name: "fireworks",
    //             apiKey: process.env.FIREWORKS_API_KEY || "test-key",
    //         } as LLMProviderConfig,
    //         model: {
    //             name: "accounts/fireworks/models/gpt-oss-120b",
    //         } as LLMModelConfig,
    //     },
    // },
    // {
    //     config: {
    //         provider: {
    //             name: "fireworks",
    //             apiKey: process.env.FIREWORKS_API_KEY || "test-key",
    //         } as LLMProviderConfig,
    //         model: {
    //             name: "accounts/fireworks/models/gpt-oss-20b",
    //         } as LLMModelConfig,
    //     },
    // },
    // {
    //     config: {
    //         provider: {
    //             name: "fireworks",
    //             apiKey: process.env.FIREWORKS_API_KEY || "test-key",
    //         } as LLMProviderConfig,
    //         model: {
    //             name: "accounts/fireworks/models/llama4-scout-instruct-basic",
    //         } as LLMModelConfig,
    //     },
    // },
    // {
    //     config: {
    //         provider: {
    //             name: "anthropic",
    //             apiKey: process.env.ANTHROPIC_API_KEY || "test-key",
    //         } as LLMProviderConfig,
    //         model: {
    //             name: "claude-3-5-haiku-20241022",
    //         } as LLMModelConfig,
    //     },
    // },
    // {
    //     config: {
    //         provider: {
    //             name: "anthropic",
    //             apiKey: process.env.ANTHROPIC_API_KEY || "test-key",
    //         } as LLMProviderConfig,
    //         model: {
    //             name: "claude-3-haiku-20240307",
    //         } as LLMModelConfig,
    //     },
    // },
];

const TEST_CASES: TestCase[] = [
    {
        id: "basic-keywords-extraction",
        query: "\n\n## Équipement Standard\n\n### Other\n- Garantie batterie: 96 mois, 160 000 km et 70\n### audio\n- 14 haut-parleurs Harman/Kardon, caisson de basse\n- Système audio de 600 watts avec écran tactile ; radio FM et radio numérique\n- Commandes radio au volant\n### brakes\n- 4 freins à disques dont 4 ventilés\n- ABS\n- Assistance au freinage d'urgence\n- Frein à main électrique\n### cargo\n- Cache-bagages flexible\n- Retenue des bagages\n- Filet de retenue\n### convenience\n- 1 prise 12V Dans le coffre et à l’avant\n- Ouverture et fermerture du coffre électrique\n- Rétroviseurs extérieurs réglables avec fonction mémoire\n- Régulateur de vitesses\n- Eclairage d'accueil\n- Miroir de courtoisie éclairé pour conducteur et passager\n- Aide au stationnement AV, AR, latéral et radar et caméra\n- Fermeture assistée Fermeture automatique du coffre\n- Système de navigation par satellite écran 11,20 pouces, 28,4 cm avec écran tactile, vue satellite, cartes mises à jour via Internet, 48 mois de mises à jour cartographiques, 48 mois d'informations sur le trafic\n- Smart card gérant : entrée sans clé, inclut démarrage sans clé et mémoire sièges Comprend paramètres programmables\n- Synthétiseur de parole Google\n- Télématique via SIM dans le véhicule avec système de suivi, notification automatique avancée de collision et assistance en cas de panne, comprend 48 mois gratuits\n- Capteur d'angle mort actif sans clignotant et Inclus prévention des risques de collis.\n- Système anti-recul\n- Caméra à 360° d'aide au stationnement vue 3D\n- Tapis de recharge sans fil\n- Commande de hayon mains libre\n- Prise de charge Type 2, Prise de charge courant alternatif 1 latéral avant\n### dimensions\n- Capacité du coffre : mini 468l. maxi 1528l. Mesures selon normes VDA\n### doors\n- Poignées extérieures des portes\n- Portes conducteur, passager, AR côté conducteur et AR côté passager et pivotante à l'AV\n### engine\n- Moteur : 4 cylindres en ligne ; 1969 cm3. Distribution :\n- 1 compresseur\n- Dépollution : E8.\n- Batterie de type lithium-ion. 426.0 volt.\n- Powertrain: PHEV\n- Configuration de l'hybridation : mixte\n- Information de recharge: recharge sur prise domestique, durée (heures) : 8.00, voltage (V) : 230, ampérage (A) : 10, 2.00, 5 et 100, information de recharge: mode 3, durée (heures) : 5.00, voltage (V) : 230, ampérage (A) : 16, 6.40, 4.00, 5, 100, 5.61, 3.23 et 3.23\n- Moteur électrique: 1 moteur, puissance ch (kW) : 145,5 ( 107,0 ) couple (Nm) : 309, Moteur synchrone à aimants permanents et arrière, moteur électrique: 2 moteurs, puissance ch (kW) : 54,4 ( 40,0 ) couple (Nm) : 160, Generateur de dema intégré et génér. démarrage int. courroie\n- Consommation d'énergie électrique WLTP (combinée) HEV UF pondérée, 180,0 (réelle), 180,0 (faible), 241,0 (élevée) \n- Autonomie électrique WLTP - cycle mixte : (Équivalent HEV Autonomie tout électrique) 80 km (faible) et 65 km (haute) \n### exterior\n- Préparation attelage\n- Spoiler sur le toit\n- Chromes sur vitres latérales et les côtés\n### fuel\n- Carburant: électricité . Autre carburant: sans plomb 95\n- Volume du réservoir de carburant : réservoir principal : 71l.\n### instrumentation\n- Tableau de bord à écran TFT, affichage tête haute et reconfigurable\n- Ordinateur de bord avec affichage de la consommation moyenne\n- Indicateur de pression des pneus affichage pression\n### lights\n- Phares à surface complexe, ampoules à LED et LED\n- Contrôle des phares: allumage automatique, phares directionnels, Feux de route actifs\n- Eclairage de virages et de bordure\n- Feux de jour\n### locks\n- Condamnation centralisée \n### paint\n- Peinture métallisée\n### performance\n- Puissance : 350 ch / 257 kW à 5500 tr/mn. Couple : 659 Nm à 2500 tr/mn\n- Consomation selon ECE 99/100:\n### roof\n- Toit ouvrant: emplacement AV, type verre, inclinable, coulissant\n- Barres de toit chromées\n- Toit vitré électrique\n### safety\n- Airbags de toit avant et arrière\n- Airbag avant conducteur, airbag avant passager avec interrupteur\n- Airbag latéral avant\n- 2 appuie-tête avant, 3 appuie-tête arrière réglables en hauteur\n- Ceinture de sécurité conducteur réglable en hauteur. Ceinture de sécurité passager réglable en hauteur.\n- Ceintures de sécurité latérales arrière réglables en hauteur. Ceinture de sécurité centrale 3-points.\n- Préparation Isofix\n- Airbag de genoux conducteur\n- Warning automatique\n- Système anti-collision qui active les ceintures de sécurité, active les feux de freinage et comprend l'assistance au freinage avant et arrière, la surveillance du conducteur, la surveillance du modèle de conduite, l'avertissement visuel/acoustique, le système d'évitement des piétons et des cyclistes, l'évitement des collisions venant en sens inverse et le virage aux carrefours ; vitesse minimale 4 km/h distance programmable, fonctionne au-dessus de 130 km/h/78 mph, fonctionne au-dessus de 50 km/h/30 mph, fonctionne en dessous de 50 km/h/30 mph, direction d'atténuation des collisions avec les piétons et système d'intervention d'urgence du conducteur\n- Anti retournement\n### seats\n- 5 places en configuration 2+3\n- Sellerie cuir\n- Accoudoir AV\n- Accoudoir central AR\n- Siège AV conducteur, passager individuel, réglage du recul mémorisable, inclinaison du dossier mémorisable, réglage en hauteur mémorisable, réglage lombaire 2-way electric, réglage en longueur d'assise électrique, inclinaison d'assise mémorisable, électrique, 7 réglages électriques\n- Sièges arrière rabattables asymétriquement, trois places, plancher plat et trappe à ski\n### steering\n- Volant multifonction aluminium en simili cuir réglable en hauteur et profondeur\n- Direction assistée asservie à la vitesse, électrique et crémaillère variable\n### storage\n- Porte gobelets à l'avant et à l'arrière\n### suspension\n- Suspensions : AV, ressorts hélicoïdaux, roues indépendantes, barre stabilisatrice, suspensions : AR, ressorts à lames, roues indépendantes, barre stabilisatrice\n### transmission\n- 4X4\n- Différentiel à glissement limité avant\n- Antipatinage\n- Transmission automatique avec mode séquentiel à 8 rapports\n- ESP\n### trim\n- Garnitures en bois et en alliage sur le tableau de bord, garnitures en bois et en alliage sur la console centrale et garnitures en cristal/verre sur le dessus du levier de vitesses\n- Tapis de sol\n### ventilation\n- Système de ventilation avec radiateur électrique, minuterie, filtre à charbon actif et commandes à écran tactile\n- Commande ventilation additionnelle siège passager\n- Climatisation automatique bi-zone\n### version\n- Finition : ULTRA BRIGHT\n- Carrosserie : SUV 5 portes\n### visibility\n- Rétroviseur intérieur automatique\n- Rétroviseur extérieur coté conducteur et Rétroviseur extérieur coté passager chauffant et chauffant , couleur caisse , grand angle , indexé marche arrière automatiquement , automatique avec clignotants\n- Rétroviseurs extérieurs rabattables électriquement\n- Lunette AR fixe avec essuie-glace intermittent\n- Essuie-glaces avec capteur de pluie\n- Lave-phares\n- Vitres électriques avant et arrière et avec deux commandes séquentielles\n### wheels\n- Pneus été : 255/45 R20 105 W\n- Jantes 8.0X20'' en alliage léger\n- Kit de réparation des pneus",
        expectedOutput: [
            "metallic-paint",
            "leather-seats",
            "5-seats",
            "park-radar",
            "park-360-camera",
            "rims-alloy",
            "rims-size-20",
            "summer-tires",
            "navigation",
            "head-up-display",
            "digital-cockpit",
            "led-lights",
            "2-zone-climate",
            "keyless-entry",
            "keyless-start",
            "adaptive-cruise-control",
            "cruise-control",
            "blind-spot-assist",
            "sunroof",
            "tire-repair-kit",
            "split-folding-rear-seats",
            "armrest-front",
            "wireless-charging",
            "hi-end-audio",
            "automatic-tailgate",
        ].sort(),
    },
    {
        id: "options-override-standard",
        query: "\n\n## Équipement Standard\n\n### audio\n- 6 haut-parleurs\n- Système audio de 80 watts avec écran tactile ; Radio AM/FM et radio numérique\n- Commandes radio au volant\n### brakes\n- 4 disques de frein et 2 disques ventilés\n- ABS\n- Assistance au freinage d'urgence\n- Frein à main électrique\n### cargo\n- Retenue des bagages\n### convenience\n- Prise 12v à l'avant\n- Eclairage d'accueil\n- Miroir de courtoisie éclairé pour conducteur et passager\n- Aide au stationnement AR de type radar\n- Téléphone supplémentaire arrière\n- Keyless start (démarrage sans clé)\n- Système d'activation vocale \n- Télématique - service d'appel d'urgence, connection via carte SIM, tracker, assistance en cas de panne\n- Tapis de recharge sans fil\n### dimensions\n- Capacité du coffre : mini 425l. Mesures selon normes VDA\n### doors\n- Poignées extérieures des portes\n- Portes conducteur, passager, AR côté conducteur et AR côté passager et pivotante à l'AV\n### engine\n- Moteur : 4 cylindres en ligne ; 1498 cm3. Distribution :\n- 1 compresseur\n- Dépollution : E8.\n- Powertrain:\n### fuel\n- Carburant: sans plomb 95\n- Volume du réservoir de carburant : réservoir principal : 50l.\n### instrumentation\n- Tableau de bord TFT\n- Ordinateur de bord avec affichage de la consommation moyenne\n- Indicateur de pression des pneus\n### lights\n- Phares ellipsoïdaux, ampoules à LED et LED\n- Allumage automatique des phares\n- Feux de jour\n### locks\n- Condamnation centralisée à distance\n### paint\n- Noir\n### performance\n- Puissance : 150 ch / 110 kW à 5000 tr/mn. Couple : 250 Nm à 1500 tr/mn\n- Consomation selon ECE 99/100: 5.4 l/100km en cycle mixte Autonomie 926 km\n### safety\n- Airbags de toit avant et arrière\n- Airbag avant conducteur, airbag avant passager avec interrupteur\n- Airbag latéral avant\n- 2 appui-têtes à réglage en hauteur avant, 3 appui-têtes à réglage en hauteur arrière\n- Ceinture de sécurité conducteur réglable en hauteur. Ceinture de sécurité passager réglable en hauteur.\n- Ceintures de sécurité à l'arrière\n- Préparation Isofix\n- Warning automatique\n- Système anticollision qui active les feux de freinage et les freins à basse vitesse, comprend une assistance au freinage, un moniteur de conduite, un moniteur de conduite, un avertissement visuel/acoustique, un système d'évitement des piétons et des cyclistes, une distance programmable de franchissement de carrefour, de virage de carrefour et d'évitement d'objets, fonctionne au-dessus de 130 km/h/78 mph, fonctionne au-dessus de 50 km/h/30 mph et fonctionne en dessous de 50 km/h/30 mph\n### seats\n- 5 places en configuration 2+3\n- Sièges sellerie tissu\n- Accoudoir AV\n- Siège AV conducteur, passager individuel, réglage lombaire 2-way electric, électrique, 2 réglages électriques, chauffant\n- Banquette arrière 3 places rabattable asymétriquement\n### steering\n- Volant en cuir réglable en hauteur, réglable en profondeur et multi-fonction\n- Direction assistée asservie à la vitesse et électrique\n### storage\n- Porte gobelets à l'avant\n### suspension\n- Suspension avant: jambe de force avec barre stabilisatrice indépendante et amortisseurs hélicoïdaux , suspension arrière: multi-bras avec barre stabilisatrice indépendante et amortisseurs hélicoïdaux\n### transmission\n- Traction\n- Différentiel à glissement limité avant\n- Antipatinage\n- Transmission manuelle à 6 rapports\n- ESP\n### trim\n- Garnissage imitation alliage de la console de plancher et imitation alliage de la planche de bord\n- Tapis de sol\n### ventilation\n- Ventilation: chaleur moteur\n- Commande ventilation additionnelle siège passager et sièges arrière\n- Climatisation automatique 3 zones\n### version\n- Finition :\n- Carrosserie : Berline tricorps 4 portes\n### visibility\n- Rétroviseur intérieur automatique\n- Rétroviseurs extérieurs caméra: côté conducteur, peints, électriques, chauffants, grand angle, électrochromes, rappels de clignotants intégrés, rétroviseurs extérieurs caméra: côté passager, peints, électriques, chauffants, automatiquement, rappels de clignotants intégrés\n- Rétroviseurs extérieurs rabattables électriquement\n- Lunette AR fixe\n- Essuie-glaces avec capteur de pluie\n- Vitres électriques avant et arrière et avec deux commandes séquentielles\n### wheels\n- Pneus été : 205/55 R16 91 V\n- Jantes 7.0X16'' en alliage léger\n- Kit de réparation des pneus",
        expectedOutput: [
            "black-paint",
            "fabric-seats",
            "5-seats",
            "heated-front-seats",
            "park-radar",
            "rims-alloy",
            "rims-size-16",
            "summer-tires",
            "digital-cockpit",
            "led-lights",
            "3-zone-climate",
            "keyless-start",
            "tire-repair-kit",
            "split-folding-rear-seats",
            "armrest-front",
            "wireless-charging",
        ].sort(),
    },
    {
        id: "max-keywords-limit",
        query: "\n\n## Équipement Standard\n\n### Other\n- Garantie de batterie 48 mois, 200,000 km, 124,275 miles, seuil de charge 70%\n### audio\n- 8 haut-parleurs\n- Système audio avec écran tactile, radio AM / FM / digitale\n- Commandes radio au volant\n### brakes\n- 4 freins à disques\n- ABS\n- Assistance au freinage d'urgence\n- Frein à main électrique\n### cargo\n- Cache-bagages rigide\n- Retenue des bagages\n- Filet de retenue\n### convenience\n- Prise 12v à l'avant\n- Ouverture et fermerture du coffre électrique\n- Régulateur de vitesse\n- Miroir de courtoisie pour conducteur et passager\n- Aide au stationnement AR de type radar\n- Fermeture assistée Fermeture automatique du coffre\n- Système de navigation par satellite écran 14,50 pouces, 36,8 cm avec écran tactile, vue satellite, cartes mises à jour via Internet et informations trafic\n- Téléphone supplémentaire arrière\n- Keyless start (démarrage sans clé)\n- Synthétiseur de parole equipement constructeur\n- Télématique - service d'appel d'urgence, connection via carte SIM, tracker, assistance en cas de panne\n- Système anti-recul\n### dimensions\n- Capacité du coffre : mini 417l. maxi 1271l.\n### doors\n- Poignées extérieures des portes\n- Portes conducteur, passager, AR côté conducteur et AR côté passager et pivotante à l'AV\n### engine\n- Moteur : 4 cylindres en ligne ; 1968 cm3. Distribution :\n- Turbo\n- Dépollution : E8.\n- Batterie de type lithium-ion.\n- Powertrain: MHEV\n- Configuration de l'hybridation : en parallèle\n- Moteur électrique: 1 moteur, Gen démarrage à courroie int. et génér. démarrage int. courroie\n### exterior\n- Inserts autour des vitres latérales chromés / polis\n### fuel\n- Carburant: diesel\n- Volume du réservoir de carburant : réservoir principal : 60l.\n### instrumentation\n- Tableau de bord TFT\n- Ordinateur de bord avec affichage de la consommation moyenne\n- Indicateur de pression des pneus\n### lights\n- Phares ellipsoïdaux, ampoules à LED et LED\n- Allumage automatique des phares\n- Feux de jour\n### locks\n- Condamnation centralisée à distance\n### paint\n- Noir\n### performance\n- Puissance : 204 ch / 150 kW à 3800 tr/mn. Couple : 400 Nm à 1750 tr/mn\n- Consomation selon ECE 99/100:\n### safety\n- Airbags de toit avant et arrière\n- Airbag avant conducteur, airbag avant passager avec interrupteur\n- Airbag latéral avant\n- 2 appui-têtes à réglage en hauteur avant, 3 appui-têtes à réglage en hauteur arrière\n- Ceinture de sécurité conducteur réglable en hauteur. Ceinture de sécurité passager réglable en hauteur.\n- Ceintures de sécurité à l'arrière\n- Warning automatique\n- Système anti-collision qui active les feux stop et les freins à basse vitesse, comprend une assistance au freinage, une surveillance du conducteur, une surveillance du modèle de conduite, un avertissement visuel/acoustique et un système d'évitement des piétons et des cyclistes à distance programmable, fonctionne au-dessus de 130 km/h/78 mph, fonctionne au-dessus de 50 km/h/30 mph et fonctionne en dessous de 50 km/h/30 mph\n### seats\n- 5 places en configuration 2+3\n- Sièges sellerie tissu\n- Accoudoir AV\n- Accoudoir central AR\n- Siège AV conducteur, passager individuel, chauffant\n- Sièges arrière face à la route avant Sièges arrière banquette, Sièges arrière sans réglage électrique, 40/20/40, Strapontins arrière fixes et Sièges arrière trois places\n### steering\n- Volant alu & cuir, réglable en hauteur, réglable en profondeur, multi-fonctions et commandes tactiles\n- Direction assistée asservie à la vitesse, électrique et crémaillère variable\n### storage\n- Porte gobelets à l'avant\n### suspension\n- Suspension avant: et arrière: multi-bras avec barre stabilisatrice indépendante et amortisseurs hélicoïdaux\n### transmission\n- 4X4\n- Antipatinage\n- Transmission manuelle robotisée double embrayage avec mode séquentiel à 7 rapports, inclut palettes au volant\n- ESP\n### trim\n- Barres en aluminium sur pommeau de levier de vitesses / console centrale / portes / tableau de bord\n- Tapis de sol\n### ventilation\n- Système de ventilation avec filtre à charbon actif\n- Climatisation automatique 1 zone\n### version\n- Finition :\n- Carrosserie : Berline bicorps 5 portes\n### visibility\n- Rétroviseur intérieur\n- Rétroviseur extérieur coté conducteur et Rétroviseur extérieur coté passager réglage électrique et chauffant , couleur caisse , grand angle avec clignotants\n- Lunette AR fixe\n- Essuie-glaces avec capteur de pluie\n- Vitres électriques avant et arrière et avec deux commandes séquentielles\n- Lave-glaces chauffants\n### wheels\n- Pneus été : 225/55 R17 101 Y\n- Jantes 7.5X17'' en alliage léger\n- Kit de réparation des pneus",
        expectedOutput: [
            "black-paint",
            "fabric-seats",
            "5-seats",
            "heated-front-seats",
            "park-radar",
            "rims-alloy",
            "rims-size-17",
            "summer-tires",
            "navigation",
            "digital-cockpit",
            "led-lights",
            "automatic-climate",
            "keyless-start",
            "cruise-control",
            "tire-repair-kit",
            "split-folding-rear-seats",
            "armrest-front",
            "automatic-tailgate",
        ].sort(),
    },
    {
        id: "irrelevant-keywords-filtered",
        query: "\n\n## Couleur Extérieure\n### Vert cyprès nacré (Couleur extérieure)\n**Description:**\n-  - Couleur extérieure vert\n## Matériau de Couleur Extérieure\n### peinture perle (Peinture)\n**Description:**\n-  - Peinture nacrée\n## Couleur Intérieure\n### Tissu noir OCEANIDIS (Couleur intérieure)\n**Description:**\n-  - Sièges sellerie tissu\n-  - Sellerie tissu noir\n\n## Options Incluses\n\n### Pack Climat\n**Description:**\n-  - Siège conducteur et passager chauffant\n-  - Volant chauffant\n-  - Vitres teintées\n\n## Équipement Standard\n\n### audio\n- 4 hauts-parleurs\n- Système audio avec écran tactile, radio AM / FM / digitale\n- Commandes radio au volant\n### brakes\n- 4 disques de frein et 2 disques ventilés\n- ABS\n- Assistance au freinage d'urgence\n### cargo\n- Cache-bagages rigide\n- Retenue des bagages\n### convenience\n- 1 prise 12V Dans le coffre et à l’avant\n- Régulateur de vitesse\n- Miroir de courtoisie éclairé pour conducteur et passager\n- Aide au stationnement avant de type radar, aide au stationnement arrière de type radar incl. caméra\n- Système de navigation par satellite écran 10,25 pouces, 26,0 cm avec écran tactile, vue satellite, cartes mises à jour via Internet, 6 mois de mises à jour cartographiques, 6 mois d'informations sur le trafic\n- Système anti-recul\n### dimensions\n- Capacité du coffre : mini 450l. maxi 1351l. Mesures selon normes VDA\n### doors\n- Poignées extérieures des portes\n- Portes conducteur, passager, AR côté conducteur et AR côté passager et pivotante à l'AV\n### engine\n- Moteur : 3 cylindres en ligne ; 998 cm3. Distribution :\n- 1 compresseur\n- Dépollution : E8.\n- Powertrain:\n### exterior\n- Préparation attelage\n- Spoiler sur le toit\n### fuel\n- Carburant: sans plomb 95\n- Volume du réservoir de carburant : réservoir principal : 50l.\n### instrumentation\n- Tableau de bord écran TFT\n- Ordinateur de bord avec affichage de la consommation moyenne\n- Indicateur de pression des pneus\n### lights\n- Phares à surface complexe, ampoules à LED et LED\n- Allumage automatique des phares\n- Antibrouillards avant\n- Eclairage de virages et de bordure\n- Feux de jour\n### locks\n- Condamnation centralisée à distance\n- Alarme\n### paint\n- Noir\n### performance\n- Puissance : 101 ch / 74 kW\n- Consomation selon ECE 99/100:\n### safety\n- Airbags de toit avant et arrière\n- Airbag avant conducteur, airbag avant passager avec interrupteur\n- Airbag latéral avant\n- 2 appui-têtes à réglage en hauteur avant, 3 appui-têtes à réglage en hauteur arrière\n- Ceinture de sécurité conducteur réglable en hauteur. Ceinture de sécurité passager réglable en hauteur.\n- Ceintures de sécurité à l'arrière\n- Préparation Isofix\n- Warning automatique\n- Système anti-collision qui active les feux stop et les freins à basse vitesse, comprend une assistance au freinage, une surveillance du conducteur, une surveillance du mode de conduite, un avertissement visuel/acoustique et un système d'évitement des piétons et des cyclistes ; vitesse minimale 10 km/h distance programmable, fonctionne au-dessus de 130 km/h/78 mph, fonctionne au-dessus de 50 km/h/30 mph et fonctionne en dessous de 50 km/h/30 mph\n### seats\n- 5 places en configuration 2+3\n- Sièges sellerie tissu\n- Accoudoir AV\n- Siège conducteur: individuel, chauffant, réglage lombaire électrique; Siège passager: individuel, chauffant\n- Sièges arrière rabattables asymétriquement, trois places, plancher plat et trappe à ski\n### steering\n- Volant en alu & cuir réglable en hauteur, réglable en profondeur, chauffant et multi-fonction\n- Direction assistée asservie à la vitesse et électrique\n### storage\n- Boîte à gants réfrigéré\n- Porte gobelets à l'avant\n### suspension\n- Suspension avant: jambe de force avec barre stabilisatrice indépendante et amortisseurs hélicoïdaux , suspension arrière: multi-bras avec barre stabilisatrice indépendante et amortisseurs hélicoïdaux\n### transmission\n- Traction\n- Antipatinage\n- Transmission manuelle à 6 rapports\n- ESP\n### trim\n- Garnissage alliage & cuir du pommeau levier de vitesses, imitation alliage de la console de plancher, imitation alliage des portes et imitation alliage de la planche de bord\n### ventilation\n- Ventilation: chaleur moteur\n- Climatisation\n### version\n- Finition : FAMILY\n- Carrosserie : Berline bicorps 5 portes\n### visibility\n- Rétroviseur intérieur\n- Rétroviseur extérieur coté conducteur et Rétroviseur extérieur coté passager réglage électrique et chauffant , couleur caisse , grand angle avec clignotants\n- Rétroviseurs extérieurs rabattables électriquement\n- Lunette AR fixe avec essuie-glace intermittent\n- Essuie-glaces avant\n- Vitres électriques avant et arrière et avec deux commandes séquentielles\n### wheels\n- Pneus été : 205/55 R16 91 H\n- Jantes 6.5X16'' en alliage léger\n- Roue de secours galette",
        expectedOutput: [
            "green-paint",
            "metallic-paint",
            "fabric-seats",
            "5-seats",
            "heated-front-seats",
            "park-radar",
            "park-rear-view-camera",
            "rims-alloy",
            "rims-size-16",
            "navigation",
            "digital-cockpit",
            "led-lights",
            "cruise-control",
            "tinted-rear-windows",
            "temporary-replacement-steel-wheel",
            "split-folding-rear-seats",
            "armrest-front",
            "automatic-climate",
        ].sort(),
    },
    {
        id: "alphabetical-sorting",
        query: "\n\n## Couleur Extérieure\n### Blanc Candy (Couleur extérieure)\n**Description:**\n-  - Couleur extérieure blanche\n## Matériau de Couleur Extérieure\n### Blanc Candy (Peinture)\n**Description:**\n-  - Noir\n## Couleur Intérieure\n### Tissu Loft/cuir (Couleur intérieure)\n**Description:**\n-  - Garnissage des sièges tissu\n-  - Sellerie tissu noir\n\n## Options Incluses\n\n### Préparation pour dispositif d'attelage (Carrosserie)\n**Description:**\n-  - Préparation attelage\n### Essuie-glace arrière pour Liftback (Visibilité)\n**Description:**\n-  - Lunette AR avec essuie-glace intermittent\n### Pack Climat (Pack)\n**Description:**\n-  - Siège conducteur et passager chauffant\n-  - Volant chauffant\n-  - Pare-brise chauffant\n### Sunset  \n### Cockpit virtuel 10 \"\n### Roue de secours en acier peu encombrante (Roues)\n**Description:**\n-  - Roue de secours roue galette et jante en acier\n\n## Équipement Standard\n\n### audio\n- 8 haut-parleurs\n- Système audio avec écran tactile couleur, radio FM / digitale\n- Commandes radio au volant\n### brakes\n- 4 disques de frein et 2 disques ventilés\n- ABS\n- Assistance au freinage d'urgence\n- Frein à main électrique\n### cargo\n- Cache-bagages rigide\n- Retenue des bagages\n### convenience\n- Prise 12v dans le coffre\n- Régulateur de vitesse\n- Miroir de courtoisie éclairé pour conducteur et passager\n- Aide au stationnement AR de type radar\n- Téléphone supplémentaire arrière\n- Keyless start (démarrage sans clé)\n- Système d'activation vocale \n- Télématique via SIM avec système de suivi, notification automatique avancée des collisions et assistance à dépannage\n- Système anti-recul\n- Tapis de recharge sans fil\n### dimensions\n- Capacité du coffre : mini 600l. maxi 1555l. Mesures selon normes VDA\n### doors\n- Poignées extérieures des portes\n- Portes conducteur, passager, AR côté conducteur et AR côté passager et pivotante à l'AV\n### engine\n- Moteur : 4 cylindres en ligne ; 1968 cm3. Distribution :\n- 1 compresseur\n- Dépollution : E8.\n- Filtre à particules\n- Powertrain:\n### exterior\n- Chromes sur les boucliers\n### fuel\n- Common rail\n- Carburant: diesel\n- Volume du réservoir de carburant : réservoir principal : 48l.\n### instrumentation\n- Tableau de bord TFT\n- Ordinateur de bord avec affichage de la consommation moyenne\n- Indicateur de pression des pneus\n### lights\n- Phares à surface complexe, ampoules à LED et LED\n- Réglage manuel de l'assiette des phares et capteur de luminosité \n- Feux de jour\n### locks\n- Condamnation centralisée à distance et incluant les lève-vitres\n### paint\n- Noir\n### performance\n- Puissance : 116 ch / 85 kW à 2750 tr/mn. Couple : 300 Nm à 1600 tr/mn\n- Consomation selon ECE 99/100:\n### safety\n- Airbags de toit avant et arrière\n- Airbag avant conducteur, airbag avant passager avec interrupteur\n- Airbag latéral avant\n- 2 appui-têtes à réglage en hauteur avant, 3 appui-têtes à réglage en hauteur arrière\n- Ceintures de sécurité avant réglables en hauteur\n- Ceintures \n- Préparation Isofix\n- Airbag de genoux conducteur\n- Warning automatique\n- Système anti-collision : activation des feux de freinage, freinage à basse vitesse, assistant au freinage, contrôle conducteur, avertissement visuel / sonore, système de protection des piétons et cyclistes, distance programmable\n### seats\n- 5 places en configuration 2+3\n- Garnissage des sièges tissu\n- Accoudoir AV\n- Accoudoir central AR\n- Siège AV conducteur, passager individuel\n- Sièges arrière: banquette 3 places avec dossier rabattable asymetriquement, assise fixe et trappe à ski\n### steering\n- Volant multifonction en aluminium et cuir réglable en hauteur, réglable en profondeur \n- Direction assistée asservie à la vitesse et électrique\n### storage\n- Porte gobelets à l'avant et à l'arrière\n### suspension\n- Suspension avant: jambe de force avec barre stabilisatrice indépendante et amortisseurs hélicoïdaux , suspension arrière: essieu torsionnel, semi-indépendante et amortisseurs hélicoïdaux\n### transmission\n- Traction\n- Différentiel à glissement limité avant\n- Antipatinage\n- Transmission manuelle à 6 rapports\n- ESP\n### trim\n- Finition : Planche de bord ; Aspect alliage. Contre portes ; Aspect alliage. Pommeau de levier de vitesse ; Aspect alliage & cuir.\n### ventilation\n- Ventilation: à affichage digitales filtre à pollen, filtre à carbone actif, écran tactile et chaleur moteur\n- Affichage digital de la commande ventilation additionnelle pour siège passager\n- Climatisation automatique bi-zone\n### version\n- Finition : SELECTION\n- Carrosserie : Berline bicorps 5 portes\n### visibility\n- Rétroviseur intérieur automatique\n- Rétroviseurs extérieurs électriques chauffants , couleur caisse avec indicateurs de direction (clignotants)\n- Rétroviseurs extérieurs rabattables électriquement\n- Lunette AR fixe\n- Essuie-glaces avec capteur de pluie\n- Vitres électriques avant et arrière et avec deux commandes séquentielles\n### wheels\n- Pneus été : 205/60 R16 92 V\n- Jantes 7.0X16'' en alliage léger\n- Kit de réparation des pneus",
        expectedOutput: [
            "white-paint",
            "fabric-seats",
            "heated-front-seats",
            "park-radar",
            "rims-alloy",
            "rims-size-16",
            "summer-tires",
            "digital-cockpit",
            "led-lights",
            "heated-windshield",
            "2-zone-climate",
            "keyless-start",
            "cruise-control",
            "tire-repair-kit",
            "split-folding-rear-seats",
            "armrest-front",
            "wireless-charging",
            "5-seats",
        ].sort(),
    },
];

/**
 * Compares how many keywords from expected are present in actual.
 * But also penalizes for extra keywords in actual that aren't in expected.
 * @param expected
 * @param actual
 * @returns
 */
const calculateAccuracy = (expected: string[], actual: string[]): number => {
    if (expected.length === 0) return actual.length === 0 ? 1 : 0;
    const matched = actual.filter((keyword) =>
        expected.includes(keyword),
    ).length;
    let score = matched / expected.length;
    // penalize for extra length of actual
    if (actual.length > expected.length) {
        score *= expected.length / actual.length;
    }
    return Math.max(0, score);
};

// Run tests if this file is executed directly
runAllTests<KeywordsExtractorResult>({
    models: LLM_MODELS_TO_TEST,
    testCases: TEST_CASES,
    timesPerTest: 3,
    runnerName: "Car Keywords Extraction Test Runner",
    testAction: async (testCase, config) => {
        const providerName = config.provider.name;
        const modelName = config.model.name;
        const extractor = new KeywordsExtractor(config);
        const startTime = Date.now();
        try {
            const result = await extractor.extractKeywords([testCase.query]);
            const executionTime = Date.now() - startTime;
            const errors: string[] = [];
            if (!result.success && result.error) {
                errors.push(result.error.message);
            }
            let accuracy = 0;
            if (testCase.expectedOutput) {
                accuracy = calculateAccuracy(
                    testCase.expectedOutput as string[],
                    result.keywords[0],
                );
            } else {
                accuracy = result.success ? 1.0 : 0.0;
            }
            let tokenCost = 0;
            if (result.llmStatistics) {
                tokenCost =
                    calculateTokenCost(
                        providerName,
                        modelName,
                        result.llmStatistics.inputTokens,
                        result.llmStatistics.outputTokens,
                    ) ?? 0;
            }
            return {
                testCase,
                providerName,
                modelName,
                result,
                accuracy,
                executionTime,
                tokenCost,
                errors,
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            return {
                testCase,
                providerName,
                modelName,
                result: {
                    keywords: [[]],
                    success: false,
                    error:
                        error instanceof Error
                            ? error
                            : new Error(errorMessage),
                    rawOutput: errorMessage,
                },
                accuracy: 0,
                executionTime,
                tokenCost: 0,
                errors: [errorMessage],
            };
        }
    },
    getResultOutput: (result) => result.keywords[0],
}).catch(console.error);

import { cache } from "react";

import { getCardImageSrc } from "@/lib/cards/image";

import { mapPrismaCardPreview } from "@/lib/mappers/cardMapper";

import type { NewsCategoryKey } from "@/lib/newsCategories";

import { prisma } from "@/lib/prisma";

import type { CardPreviewData } from "@/types/CardPreviewData";

export {
  getNewsCategory,
  NEWS_CATEGORIES,
  type NewsCategoryDefinition,
  type NewsCategoryKey,
} from "@/lib/newsCategories";

export interface NewsSection {
  heading: string;

  paragraphs: string[];

  bullets?: string[];
}

interface NewsBannerSeed {
  kind: "set" | "card";

  slug: string;
}

interface NewsArticleSeed {
  slug: string;

  title: string;

  summary: string;

  category: NewsCategoryKey;

  author: string;

  publishedAt: string;

  tags: string[];

  banner: NewsBannerSeed | null;

  featuredCardNames: string[];

  sections: NewsSection[];
}

export interface NewsArticle {
  slug: string;

  title: string;

  summary: string;

  category: NewsCategoryKey;

  author: string;

  publishedAt: string;

  readingMinutes: number;

  tags: string[];

  bannerUrl: string | null;

  bannerAlt: string;

  featuredCards: CardPreviewData[];

  sections: NewsSection[];
}

const ARTICLE_SEEDS: NewsArticleSeed[] = [
  {
    slug: "snake-eye-domina-meta-weekly-312",
    title: "Snake-Eye domina el Meta Weekly #312",
    summary:
      "El arquetipo de fuego vuelve a firmar el mejor resultado del fin de semana: tres copias de Poplar, un sideboard intacto y un espejo que ya tiene respuesta.",
    category: "updates",
    author: "Redacción Card Meta",
    publishedAt: "2026-11-10T09:30:00.000Z",
    tags: ["Snake-Eye", "Meta Weekly", "Competitivo"],
    banner: {
      kind: "set",
      slug: "shooting-majesty",
    },
    featuredCardNames: [
      "Snake-Eyes Poplar",
      "Snake-Eyes Flamberge Dragon",
      "Promethean Princess, Bestower of Flames",
      "S:P Little Knight",
    ],
    sections: [
      {
        heading: "El resultado del fin de semana",
        paragraphs: [
          "Snake-Eye vuelve a colocarse en la cima del Meta Weekly. La lista campeona apuesta por un motor compacto, con tres copias de Snake-Eyes Poplar y un paquete de extensores que le permite jugar a través de una interrupción sin comprometer todo el tablero.",
          "El dato más relevante no es la victoria, sino la consistencia: el arquetipo apareció en cuatro de los ocho puestos del Top 8. La comunidad ya lo trata como el rival a batir y las listas de sideboard empiezan a reflejarlo.",
        ],
      },
      {
        heading: "La lista campeona",
        paragraphs: [
          "La versión ganadora prioriza la capacidad de reconstruir el campo en el turno dos. Promethean Princess actúa como extensión y como amenaza recurrente, mientras que S:P Little Knight da una salida limpia a los tableros más cargados.",
          "El sideboard mantiene un equilibrio entre respuestas a monstruos y herramientas para el espejo. No hay espacio para cartas situacionales: cada slot tiene que servir en al menos dos matchups del top cut.",
        ],
        bullets: [
          "Tres Poplar para maximizar la probabilidad de apertura.",
          "Un paquete de hand traps ajustado al ritmo del formato.",
          "Cierre con Flamberge y presión constante en el turno siguiente.",
        ],
      },
      {
        heading: "Qué mirar en el espejo",
        paragraphs: [
          "El mirror se decide por quién administra mejor la primera interrupción. Guardar la extensión correcta vale más que forzar el tablero completo, sobre todo cuando el rival tiene acceso a Kurikara o a una carta de remoción puntual.",
          "La próxima semana será clave para ver si el resto del top cut adapta sus listas o si Snake-Eye sigue marcando el ritmo del formato.",
        ],
      },
    ],
  },
  {
    slug: "guia-snake-eye-combos",
    title: "Guía de Snake-Eye: líneas, extensiones y cierres",
    summary:
      "De la apertura con Poplar a la línea de Flamberge: cómo encadenar el combo sin quedarte sin recursos y cuándo romper el turno.",
    category: "guides",
    author: "Wolf",
    publishedAt: "2026-11-08T12:00:00.000Z",
    tags: ["Snake-Eye", "Guía", "Combos"],
    banner: {
      kind: "card",
      slug: "Snake-Eyes-Poplar",
    },
    featuredCardNames: [
      "Snake-Eyes Poplar",
      "Snake-Eyes Flamberge Dragon",
      "Promethean Princess, Bestower of Flames",
      "I:P Masquerena",
    ],
    sections: [
      {
        heading: "La apertura",
        paragraphs: [
          "La línea más eficiente empieza con Poplar y una carta que permita convertirla en extensión. El objetivo no es desplegar todo, sino llegar al primer Link con recursos suficientes para responder a una interrupción.",
          "Si la mano no permite completar la secuencia, conviene priorizar un tablero intermedio con una negación y una amenaza recurrente. Forzar el combo completo suele dejar el turno sin cartas y sin plan B.",
        ],
      },
      {
        heading: "Extensiones",
        paragraphs: [
          "Promethean Princess es la pieza que convierte una apertura correcta en una amenaza de varios turnos. Su valor aumenta cuando el rival depende de destruir monstruos para activar sus propias condiciones.",
          "I:P Masquerena permite jugar en el turno del oponente y protege el cierre del combo. No siempre hay que usarla de inmediato: a veces conviene guardarla para responder a una remoción clave.",
        ],
      },
      {
        heading: "Cierres y tablero",
        paragraphs: [
          "El tablero ideal combina una interrupción temprana con una fuente de presión que obligue al rival a gastar recursos. Flamberge y S:P Little Knight cubren ese rol sin exigir demasiadas cartas adicionales.",
        ],
        bullets: [
          "No sobreextiendas si ya tienes una interrupción activa.",
          "Reserva una extensión para el turno del rival.",
          "Prioriza la línea que sobrevive a una sola negación.",
        ],
      },
      {
        heading: "Errores comunes",
        paragraphs: [
          "El error más frecuente es encadenar el combo sin leer el cementerio del oponente. Kurikara y otras herramientas de castigo pueden convertir un tablero enorme en una derrota inmediata.",
          "El segundo error es ignorar el reloj de recursos: Snake-Eye gana los turnos largos, pero solo si conserva acceso a su motor. Administrar el cementerio es tan importante como administrar la mano.",
        ],
      },
    ],
  },
  {
    slug: "filtracion-shooting-majesty",
    title: "Shooting Majesty: filtraciones, reprints y cartas clave",
    summary:
      "El próximo box llega con soporte para Dragón y una selección de reprints que puede mover el mercado de UR.",
    category: "leaks",
    author: "Redacción Card Meta",
    publishedAt: "2026-11-06T08:15:00.000Z",
    tags: ["Shooting Majesty", "Leaks", "Box"],
    banner: {
      kind: "set",
      slug: "shooting-majesty",
    },
    featuredCardNames: [
      "Red-Eyes Black Dragon",
      "Blue-Eyes White Dragon",
      "Forbidden Droplet",
    ],
    sections: [
      {
        heading: "Lo que apunta la filtración",
        paragraphs: [
          "Las primeras filtraciones de Shooting Majesty apuntan a un box centrado en el soporte de Dragón, con varias cartas que ya tienen hueco en listas competitivas. La información todavía no es oficial, así que conviene tratar los ratios como provisionales.",
          "El banner del set ya está disponible en la base de datos de Duel Links Meta y coincide con la línea visual de los últimos lanzamientos. Eso no confirma el contenido, pero sí la ventana de lanzamiento.",
        ],
      },
      {
        heading: "Reprints que importan",
        paragraphs: [
          "Si se confirman los reprints filtrados, el box podría rebajar el coste de entrada a varios arquetipos. Forbidden Droplet sigue siendo una de las cartas más demandadas y su reimpresión tendría un impacto directo en el mercado.",
        ],
        bullets: [
          "Forbidden Droplet como reprint de alto impacto.",
          "Soporte de Dragón con sinergia directa para Blue-Eyes y Red-Eyes.",
          "Cartas de remoción para el sideboard del formato actual.",
        ],
      },
      {
        heading: "Impacto competitivo",
        paragraphs: [
          "Un box con soporte de Dragón y reprints de staples suele mover el meta en dos direcciones: mejora la consistencia de los mazos existentes y reduce la barrera de entrada para nuevos jugadores.",
          "La clave estará en si las cartas nuevas resuelven los problemas actuales de Blue-Eyes o si solo añaden líneas adicionales a un arquetipo que ya es fuerte.",
        ],
      },
      {
        heading: "Qué falta por confirmar",
        paragraphs: [
          "Faltan por confirmar rarezas, ratios y la fecha exacta de disponibilidad en el juego. Hasta entonces, la recomendación es no gastar gemas en función de una filtración y esperar a la información oficial.",
        ],
      },
    ],
  },
  {
    slug: "banlist-noviembre-2026-analisis",
    title: "Banlist de noviembre: las cartas que cambian el formato",
    summary:
      "Analizamos los hits y las liberaciones de la lista más reciente y qué arquetipos ganan o pierden consistencia en Speed Duel.",
    category: "banlist",
    author: "Redacción Card Meta",
    publishedAt: "2026-11-04T18:00:00.000Z",
    tags: ["Banlist", "Speed Duel", "Meta"],
    banner: {
      kind: "card",
      slug: "Forbidden-Droplet",
    },
    featuredCardNames: [
      "Forbidden Droplet",
      "Lightning Storm",
      "Kurikara Divincarnate",
    ],
    sections: [
      {
        heading: "Los hits",
        paragraphs: [
          "La nueva lista toca varias de las herramientas que dominaron el último ciclo de torneos. Los límites buscan reducir la capacidad de respuesta gratuita y obligar a los mazos a elegir entre consistencia y interacción.",
          "Forbidden Droplet y Lightning Storm siguen siendo cartas centrales del formato, pero su disponibilidad cambia según el arquetipo. Los mazos que dependían de ambas pierden margen de maniobra.",
        ],
      },
      {
        heading: "Las liberaciones",
        paragraphs: [
          "Las liberaciones benefician a los arquetipos que habían quedado fuera del top cut. Algunas piezas vuelven a estar disponibles y eso reabre líneas de juego que llevaban meses sin verse en competitivo.",
          "El efecto más inmediato se notará en los mazos de control, que recuperan herramientas para gestionar tableros grandes sin comprometer todo el sideboard.",
        ],
      },
      {
        heading: "Ganadores y perdedores",
        paragraphs: [
          "Snake-Eye mantiene su posición gracias a un motor que no depende de una sola carta. Blue-Eyes y Dark Magician ganan algo de aire, aunque siguen necesitando resolver sus problemas de consistencia.",
        ],
        bullets: [
          "Ganadores: arquetipos con motores internos y pocas dependencias.",
          "Perdedores: listas que abusaban de una única interrupción.",
          "A vigilar: el retorno de cartas de remoción al sideboard.",
        ],
      },
      {
        heading: "Cómo ajustar tu lista",
        paragraphs: [
          "Antes de cambiar el mazo entero, revisa qué cartas de la banlist usabas y qué rol cumplían. En muchos casos basta con sustituir una interrupción por otra y mantener el plan de juego.",
          "La primera semana después de una banlist siempre está inflada de experimentos. Espera a los resultados de los torneos comunitarios antes de invertir gemas en un arquetipo nuevo.",
        ],
      },
    ],
  },
  {
    slug: "guia-blue-eyes-cefiro",
    title: "Blue-Eyes: la guía de Céfiro para el formato actual",
    summary:
      "Cómo construir el motor de dragones, qué ratios resisten la banlist y por qué el skill sigue marcando la diferencia.",
    category: "guides",
    author: "Rin",
    publishedAt: "2026-11-01T10:00:00.000Z",
    tags: ["Blue-Eyes", "Guía", "Speed Duel"],
    banner: {
      kind: "card",
      slug: "Blue-Eyes-White-Dragon",
    },
    featuredCardNames: [
      "Blue-Eyes White Dragon",
      "Forbidden Droplet",
      "S:P Little Knight",
      "Kurikara Divincarnate",
    ],
    sections: [
      {
        heading: "El motor",
        paragraphs: [
          "Blue-Eyes sigue siendo un mazo de presión constante. La base de dragones y cartas de búsqueda permite abrir con un tablero sólido, pero la diferencia entre una lista buena y una excelente está en los ratios.",
          "El objetivo es maximizar la probabilidad de ver una carta de inicio sin llenar el mazo de piezas que solo funcionan en combinación. La consistencia importa más que el techo teórico.",
        ],
      },
      {
        heading: "Ratios y consistencia",
        paragraphs: [
          "La banlist obliga a replantear algunas configuraciones. Los ratios que antes eran estándar ahora dejan el mazo corto de interacción, así que conviene reservar espacio para respuestas versátiles.",
        ],
        bullets: [
          "Prioriza cartas de inicio que funcionen solas.",
          "Evita más de dos copias de piezas situacionales.",
          "Ajusta el sideboard según el top cut esperado.",
        ],
      },
      {
        heading: "El skill",
        paragraphs: [
          "El skill sigue siendo una parte central del plan. No solo mejora la consistencia, también permite jugar líneas que serían imposibles con un mazo genérico. Elegir el skill correcto cambia los ratios recomendados.",
          "En el espejo, el skill marca el ritmo. Quien lo aprovecha primero suele obligar al rival a responder con recursos que necesitará más tarde.",
        ],
      },
      {
        heading: "Matchups",
        paragraphs: [
          "Contra Snake-Eye, el plan pasa por interrumpir la primera extensión y no gastar toda la remoción en el tablero inicial. Contra mazos de control, Blue-Eyes necesita cerrar rápido antes de que el rival acumule ventaja.",
          "La clave está en identificar cuál es la carta que el rival no puede permitirse perder y guardar la respuesta para ese momento.",
        ],
      },
    ],
  },
  {
    slug: "selection-box-mini-vol-8",
    title: "Selection Box Mini Vol. 8: lo mejor del nuevo mini box",
    summary:
      "Repasamos las cartas con más potencial competitivo del mini box y las que conviene evitar si buscas eficiencia de gemas.",
    category: "leaks",
    author: "Redacción Card Meta",
    publishedAt: "2026-10-28T07:45:00.000Z",
    tags: ["Selection Box", "Mini Box", "Gemas"],
    banner: {
      kind: "set",
      slug: "selection-box-mini-vol-8",
    },
    featuredCardNames: [
      "Diabellstar the Black Witch",
      "WANTED: Seeker of Sinful Spoils",
      "S:P Little Knight",
    ],
    sections: [
      {
        heading: "Cartas destacadas",
        paragraphs: [
          "El Selection Box Mini Vol. 8 llega con varias cartas que ya tienen presencia en el meta. Diabellstar y WANTED forman un paquete con sinergia directa, mientras que S:P Little Knight sigue siendo una de las extra deck más versátiles del juego.",
          "El box está pensado para jugadores que buscan piezas concretas, no para completar un arquetipo desde cero. Eso cambia por completo la forma de evaluar su valor.",
        ],
      },
      {
        heading: "Valor competitivo",
        paragraphs: [
          "La presencia de staples en un mini box suele traducirse en una mejor relación gemas/valor, siempre que las cartas encajen en tus mazos. Si no juegas los arquetipos que las aprovechan, el cálculo cambia.",
        ],
        bullets: [
          "Alto valor si ya tienes un motor de fuego u oscuridad.",
          "Valor medio para coleccionistas y jugadores casuales.",
          "Bajo valor si solo buscas una carta concreta y no hay pity garantizado.",
        ],
      },
      {
        heading: "Relación gemas/valor",
        paragraphs: [
          "Antes de abrir, define cuántas cartas del box necesitas realmente. Si el número es inferior a tres, probablemente sea mejor esperar a un box principal o a una futura reimpresión.",
          "La eficiencia de gemas no se mide por la rareza de la carta, sino por cuántos mazos competitivos puede mejorar. Una UR que no encaja en tu colección vale menos que una SR que usas en tres listas.",
        ],
      },
      {
        heading: "Veredicto",
        paragraphs: [
          "El mini box es interesante para quien ya tenga el motor necesario para aprovechar sus mejores cartas. Para el resto, es una colección de piezas que probablemente vuelvan en futuros lanzamientos.",
        ],
      },
    ],
  },
  {
    slug: "aniversario-box-vol-04-repaso",
    title: "Anniversary Box Vol. 04: un repaso a sus mejores cartas",
    summary:
      "El box de aniversario trae reprints de alto impacto y nuevas piezas para arquetipos de fuego y dragón.",
    category: "updates",
    author: "Redacción Card Meta",
    publishedAt: "2026-10-24T11:20:00.000Z",
    tags: ["Anniversary Box", "Reprints", "Colección"],
    banner: {
      kind: "set",
      slug: "anniversary-box-vol-04",
    },
    featuredCardNames: [
      "Snake-Eyes Poplar",
      "Diabellstar the Black Witch",
      "Blue-Eyes White Dragon",
    ],
    sections: [
      {
        heading: "Qué incluye",
        paragraphs: [
          "El Anniversary Box Vol. 04 combina reprints de cartas muy buscadas con nuevas piezas para arquetipos establecidos. Es un lanzamiento pensado para jugadores que quieren reforzar su colección sin depender de un único arquetipo.",
          "La selección de cartas toca fuego, dragón y oscuridad, tres de los ejes más presentes en el formato actual. Eso lo convierte en un box con demanda transversal.",
        ],
      },
      {
        heading: "Reprints clave",
        paragraphs: [
          "Snake-Eyes Poplar y Diabellstar siguen siendo cartas centrales en sus respectivos motores. Su presencia en el box reduce la barrera de entrada y aumenta la oferta disponible en el mercado.",
        ],
        bullets: [
          "Poplar para jugadores de Snake-Eye.",
          "Diabellstar como pieza de motores de oscuridad.",
          "Blue-Eyes White Dragon como reprint emblemático.",
        ],
      },
      {
        heading: "¿Vale la pena?",
        paragraphs: [
          "Depende de cuántas de las cartas destacadas necesites. Si te faltan dos o más piezas clave, el box tiene sentido. Si solo buscas una, probablemente sea mejor esperar a una reimpresión específica.",
        ],
      },
      {
        heading: "Conclusión",
        paragraphs: [
          "Es un box sólido para la comunidad, con cartas que seguirán viéndose en torneos. No cambia el meta por sí solo, pero facilita el acceso a piezas que hasta ahora eran difíciles de conseguir.",
        ],
      },
    ],
  },
  {
    slug: "impacto-banlist-dark-magician",
    title: "El impacto de la banlist en Dark Magician",
    summary:
      "La lista deja al arquetipo en una posición incómoda: menos consistencia, pero un techo competitivo que sigue vivo.",
    category: "banlist",
    author: "Dante",
    publishedAt: "2026-10-20T16:30:00.000Z",
    tags: ["Dark Magician", "Banlist", "Análisis"],
    banner: {
      kind: "card",
      slug: "Dark-Magician",
    },
    featuredCardNames: [
      "Dark Magician",
      "Lightning Storm",
      "Forbidden Droplet",
    ],
    sections: [
      {
        heading: "Qué cambió",
        paragraphs: [
          "Dark Magician pierde parte de la consistencia que lo mantenía en el top cut. La banlist no destruye el arquetipo, pero obliga a elegir entre cartas de búsqueda y respuestas defensivas.",
          "El resultado es una lista más frágil en la apertura y más dependiente de la calidad de la mano inicial. En un formato rápido, eso se paga caro.",
        ],
      },
      {
        heading: "La lista que sobrevive",
        paragraphs: [
          "Las versiones que mejor se adaptan reducen la dependencia de una sola línea y añaden cartas de interacción versátiles. El objetivo es llegar al turno tres con recursos suficientes para cerrar.",
        ],
        bullets: [
          "Menos piezas de combo y más respuestas inmediatas.",
          "Un motor de búsqueda ajustado al nuevo límite.",
          "Sideboard orientado a los matchups más frecuentes.",
        ],
      },
      {
        heading: "Matchups",
        paragraphs: [
          "Contra Snake-Eye, Dark Magician necesita interrumpir la primera extensión y evitar que el rival reconstruya el tablero. Contra Blue-Eyes, la clave es no quedarse sin remoción antes del cierre.",
          "El arquetipo sigue teniendo un techo alto, pero exige un manejo de recursos más cuidadoso que antes. No es un mazo para jugar en piloto automático.",
        ],
      },
      {
        heading: "Veredicto",
        paragraphs: [
          "Dark Magician sigue siendo viable en manos experimentadas, aunque deja de ser una opción cómoda para el top cut. La banlist lo castiga, pero no lo elimina.",
        ],
      },
    ],
  },
  {
    slug: "guia-dark-magician-consistencia",
    title: "Dark Magician: consistencia por encima de la nostalgia",
    summary:
      "Ajustes de ratios, cartas de búsqueda y un plan de juego claro para que el mago deje de depender de la mano perfecta.",
    category: "guides",
    author: "Dante",
    publishedAt: "2026-10-16T09:00:00.000Z",
    tags: ["Dark Magician", "Guía", "Consistencia"],
    banner: {
      kind: "card",
      slug: "Dark-Magician",
    },
    featuredCardNames: [
      "Dark Magician",
      "I:P Masquerena",
      "Knightmare Phoenix",
    ],
    sections: [
      {
        heading: "El problema de la consistencia",
        paragraphs: [
          "Dark Magician tiene un problema conocido: muchas manos buenas y muy pocas manos perfectas. La diferencia entre ganar y perder suele estar en la capacidad de convertir una apertura mediocre en un tablero funcional.",
          "La solución no es añadir más cartas de combo, sino reducir la varianza y asegurar que cada carta cumpla un rol claro en la mano inicial.",
        ],
      },
      {
        heading: "Ratios recomendados",
        paragraphs: [
          "La base del mazo debe garantizar acceso al mago y a una carta de interacción. Los ratios que funcionan en torneo suelen ser más conservadores de lo que parece en las listas de internet.",
        ],
        bullets: [
          "Mantén el motor principal en el mínimo viable.",
          "Incluye cartas que funcionen solas en la mano.",
          "Reserva espacio para respuestas de amplio espectro.",
        ],
      },
      {
        heading: "Plan de juego",
        paragraphs: [
          "El plan es simple: sobrevivir al primer turno, recuperar recursos y ganar la partida en el intercambio. Dark Magician no necesita cerrar en un turno, necesita no quedarse sin cartas.",
          "I:P Masquerena y Knightmare Phoenix dan flexibilidad para interactuar sin comprometer el motor. Son piezas de soporte, no el centro del combo.",
        ],
      },
      {
        heading: "Ajustes de side",
        paragraphs: [
          "El sideboard debe cubrir los matchups más comunes del top cut. Contra mazos de fuego, prioriza interrupciones tempranas. Contra control, añade presión y formas de romper tableros establecidos.",
        ],
      },
    ],
  },
];

const FEATURED_CARD_SELECT = {
  id: true,

  ygoproId: true,

  name: true,

  slug: true,

  format: true,

  image: true,

  type: true,

  attribute: true,

  race: true,

  rarity: true,

  archetype: true,

  level: true,

  linkRating: true,

  linkMarkers: true,

  scale: true,

  attack: true,

  defense: true,

  frameType: true,

  description: true,
} as const;

function estimateReadingMinutes(
  sections: NewsSection[]
): number {
  const words = sections.reduce(
    (total, section) => {
      const paragraphWords = section.paragraphs.reduce(
        (sum, paragraph) =>
          sum + paragraph.trim().split(/\s+/).length,
        0
      );

      const bulletWords = (section.bullets ?? []).reduce(
        (sum, bullet) =>
          sum + bullet.trim().split(/\s+/).length,
        0
      );

      return total + paragraphWords + bulletWords;
    },
    0
  );

  return Math.max(3, Math.ceil(words / 180));
}

/**
 * Resuelve banners y cartas destacadas contra PostgreSQL.
 *
 * Los artículos son contenido editorial curado, pero las
 * imágenes y los datos de carta siempre salen de la base de
 * datos real para evitar enlaces o imágenes rotas.
 */
export const getNewsArticles = cache(
  async (): Promise<NewsArticle[]> => {
    const featuredNames = Array.from(
      new Set(
        ARTICLE_SEEDS.flatMap(
          (article) => article.featuredCardNames
        )
      )
    );

    const bannerSetSlugs = Array.from(
      new Set(
        ARTICLE_SEEDS.flatMap((article) =>
          article.banner?.kind === "set"
            ? [article.banner.slug]
            : []
        )
      )
    );

    const bannerCardSlugs = Array.from(
      new Set(
        ARTICLE_SEEDS.flatMap((article) =>
          article.banner?.kind === "card"
            ? [article.banner.slug]
            : []
        )
      )
    );

    const [featuredCards, bannerSets, bannerCards] =
      await Promise.all([
        prisma.card.findMany({
          where: {
            name: {
              in: featuredNames,
            },
          },

          select: FEATURED_CARD_SELECT,
        }),

        prisma.setMeta.findMany({
          where: {
            slug: {
              in: bannerSetSlugs,
            },
          },

          select: {
            slug: true,
            name: true,
            bannerUrl: true,
          },
        }),

        prisma.card.findMany({
          where: {
            slug: {
              in: bannerCardSlugs,
            },
          },

          select: {
            slug: true,
            name: true,
            image: true,
            ygoproId: true,
          },
        }),
      ]);

    const featuredByName = new Map(
      featuredCards.map((card) => [card.name, card])
    );

    const setsBySlug = new Map(
      bannerSets.map((set) => [set.slug, set])
    );

    const cardsBySlug = new Map(
      bannerCards.map((card) => [card.slug, card])
    );

    const articles = ARTICLE_SEEDS.map((seed) => {
      const featured = seed.featuredCardNames
        .map((name) => featuredByName.get(name))
        .filter(
          (
            card
          ): card is (typeof featuredCards)[number] =>
            Boolean(card)
        )
        .map(mapPrismaCardPreview);

      let bannerUrl: string | null = null;

      let bannerAlt = seed.title;

      if (seed.banner?.kind === "set") {
        const set = setsBySlug.get(seed.banner.slug);

        bannerUrl = set?.bannerUrl ?? null;

        bannerAlt = set?.name ?? seed.title;
      }

      if (seed.banner?.kind === "card") {
        const card = cardsBySlug.get(seed.banner.slug);

        bannerUrl = getCardImageSrc(card);

        bannerAlt = card?.name ?? seed.title;
      }

      return {
        slug: seed.slug,

        title: seed.title,

        summary: seed.summary,

        category: seed.category,

        author: seed.author,

        publishedAt: seed.publishedAt,

        readingMinutes: estimateReadingMinutes(
          seed.sections
        ),

        tags: seed.tags,

        bannerUrl,

        bannerAlt,

        featuredCards: featured,

        sections: seed.sections,
      };
    });

    return articles.sort((a, b) =>
      b.publishedAt.localeCompare(a.publishedAt)
    );
  }
);

export async function getNewsArticle(
  slug: string
): Promise<NewsArticle | null> {
  const articles = await getNewsArticles();

  return (
    articles.find(
      (article) => article.slug === slug
    ) ?? null
  );
}

export async function getRelatedNews(
  article: NewsArticle,
  limit = 3
): Promise<NewsArticle[]> {
  const articles = await getNewsArticles();

  const sameCategory = articles.filter(
    (item) =>
      item.slug !== article.slug &&
      item.category === article.category
  );

  const others = articles.filter(
    (item) =>
      item.slug !== article.slug &&
      item.category !== article.category
  );

  return [...sameCategory, ...others].slice(0, limit);
}

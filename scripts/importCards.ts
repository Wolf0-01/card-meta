import { prisma } from "../src/lib/prisma";

import { slugifyCardName } from "../src/lib/cardSlug";

import axios from "axios";
import fs from "fs";
import path from "path";


let imported = 0;
let failed = 0;


async function downloadImage(
  url: string,
  fileName: string
) {
  const folder = path.join(
    process.cwd(),
    "public",
    "cards"
  );


  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, {
      recursive: true,
    });
  }


  const filePath = path.join(
    folder,
    fileName
  );


  // Evitar descargar imágenes existentes
  if (fs.existsSync(filePath)) {
    return;
  }


  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });


  fs.writeFileSync(
    filePath,
    response.data
  );


  console.log(
    `🖼 Imagen guardada: ${fileName}`
  );
}



/**
 * Genera un slug único para la carta durante la importación.
 *
 * Los nombres de YGOPRODeck suelen ser únicos, pero dos
 * cartas distintas pueden normalizarse al mismo slug. En ese
 * caso se añade un sufijo numérico estable.
 */
async function resolveImportSlug(
  name: string,
  ygoproId: number
): Promise<string> {
  const base =
    slugifyCardName(name) ||
    `card-${ygoproId}`;

  let candidate = base;

  let suffix = 2;

  for (;;) {
    const existing =
      await prisma.card.findUnique({
        where: {
          slug: candidate,
        },

        select: {
          ygoproId: true,
        },
      });

    if (
      !existing ||
      existing.ygoproId === ygoproId
    ) {
      return candidate;
    }

    candidate = `${base}-${suffix}`;

    suffix++;
  }
}

async function main() {

  console.log(
    "🚀 Iniciando importación YGOPRODeck"
  );


  const response = await fetch(
    "https://db.ygoprodeck.com/api/v7/cardinfo.php"
  );


  const data = await response.json();


  const cards = data.data;


  console.log(
    `Cartas recibidas: ${cards.length}`
  );



  for (
    let i = 0;
    i < cards.length;
    i++
  ) {

    const card = cards[i];


    try {


      console.log(
        `[${i + 1}/${cards.length}] ${card.name}`
      );



      const imageUrl =
        card.card_images?.[0]?.image_url;



      const slug =
        await resolveImportSlug(
          card.name,
          card.id
        );



      // Descargar imagen local

      if (imageUrl) {

        await downloadImage(
          imageUrl,
          `${card.id}.jpg`
        );

      }



      // Guardar / actualizar carta

      await prisma.card.upsert({

        where: {
          ygoproId: card.id,
        },


        update: {

          name:
            card.name,

          slug,

          type:
            card.type,

          attribute:
            card.attribute ?? null,

          level:
            card.level ?? null,

          attack:
            card.atk ?? null,

          defense:
            card.def ?? null,


          archetype:
            card.archetype ?? null,


          race:
            card.race ?? null,


          frameType:
            card.frameType ?? null,


          scale:
            card.scale ?? null,


          linkRating:
            card.linkval ?? null,


          linkMarkers:
            card.linkmarkers ?? null,


          description:
            card.desc ?? null,


          image:
            imageUrl
              ? `/cards/${card.id}.jpg`
              : null,

        },



        create: {

          ygoproId:
            card.id,


          name:
            card.name,


          slug,


          type:
            card.type,


          attribute:
            card.attribute ?? null,


          level:
            card.level ?? null,


          attack:
            card.atk ?? null,


          defense:
            card.def ?? null,


          rarity:
            null,


          archetype:
            card.archetype ?? null,


          race:
            card.race ?? null,


          frameType:
            card.frameType ?? null,


          scale:
            card.scale ?? null,


          linkRating:
            card.linkval ?? null,


          linkMarkers:
            card.linkmarkers ?? null,


          description:
            card.desc ?? null,


          image:
            imageUrl
              ? `/cards/${card.id}.jpg`
              : null,

        },

      });



      imported++;


    } catch(error) {


      failed++;


      console.error(
        `❌ Error con ${card.name}`,
        error
      );


    }

  }

}




main()

.then(async () => {


  await prisma.$disconnect();


  console.log("");

  console.log(
    "====== Resumen ======"
  );


  console.log(
    `Importadas: ${imported}`
  );


  console.log(
    `Errores: ${failed}`
  );


  console.log(
    "✅ Importación terminada"
  );


})


.catch(async(error)=>{


  console.error(error);


  await prisma.$disconnect();


  process.exit(1);


});
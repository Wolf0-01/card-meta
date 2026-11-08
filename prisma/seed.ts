import "dotenv/config";

import {
  PrismaClient,
  DeckTrend
} from "@prisma/client";

import {
  PrismaPg
} from "@prisma/adapter-pg";



const adapter = new PrismaPg({

  connectionString:
    process.env.DATABASE_URL!

});



const prisma = new PrismaClient({

  adapter

});





async function main(){


  /*
    LIMPIAR DECKS DE PRUEBA
  */

  await prisma.deck.deleteMany({

    where:{

      deckHash:{
        in:[
          "blue-eyes-white-dragon-001",
          "dark-magician-001"
        ]
      }

    }

  });







  /*
    CREAR CARTAS
  */


  await prisma.card.createMany({

    skipDuplicates:true,


    data:[


      {

        name:"Blue-Eyes White Dragon",

        slug:"Blue-Eyes-White-Dragon",

        type:"Monster",

        attribute:"LIGHT",

        level:8,

        attack:3000,

        defense:2500,

        rarity:"UR",

        description:
        "Un poderoso dragón legendario."

      },


      {

        name:"Dark Magician",

        slug:"Dark-Magician",

        type:"Monster",

        attribute:"DARK",

        level:7,

        attack:2500,

        defense:2100,

        rarity:"UR",

        description:
        "El mago definitivo."

      },


      {

        name:"Mystical Space Typhoon",

        slug:"Mystical-Space-Typhoon",

        type:"Spell",

        rarity:"SR",

        description:
        "Destruye una carta mágica o trampa."

      }


    ]

  });



  console.log(
    "Cartas creadas"
  );








  /*
    OBTENER CARTAS
  */


  const blueEyesCard =
  await prisma.card.findUnique({

    where:{
      name:"Blue-Eyes White Dragon"
    }

  });



  const darkMagicianCard =
  await prisma.card.findUnique({

    where:{
      name:"Dark Magician"
    }

  });



  const mstCard =
  await prisma.card.findUnique({

    where:{
      name:"Mystical Space Typhoon"
    }

  });





  if(
    !blueEyesCard ||
    !darkMagicianCard ||
    !mstCard
  ){

    throw new Error(
      "No se encontraron cartas"
    );

  }









  /*
    CREAR ARQUETIPOS
  */


  const blueEyesArchetype =
  await prisma.archetype.upsert({

    where:{

      slug:"blue-eyes"

    },


    update:{},


    create:{

      name:"Blue Eyes",

      slug:"blue-eyes",

      description:
      "Arquetipo basado en Blue-Eyes White Dragon."

    }

  });





  const darkMagicianArchetype =
  await prisma.archetype.upsert({

    where:{

      slug:"dark-magician"

    },


    update:{},


    create:{

      name:"Dark Magician",

      slug:"dark-magician",

      description:
      "Arquetipo basado en Dark Magician."

    }

  });









  /*
    CREAR BLUE EYES DECK
  */


  await prisma.deck.upsert({

    where:{

      deckHash:
      "blue-eyes-white-dragon-001"

    },


    update:{


      name:
      "Blue Eyes White Dragon",


      archetypeId:
      blueEyesArchetype.id,


      tier:
      "Tier 1",


      tierOrder:
      1,


      popularity:
      25,


      tournamentResults:
      15,


      trend:
      DeckTrend.up,


      wins:
      120,


      losses:
      30


    },


    create:{


      name:
      "Blue Eyes White Dragon",


      slug:
      "blue-eyes-white-dragon",


      deckHash:
      "blue-eyes-white-dragon-001",



      archetypeId:
      blueEyesArchetype.id,



      tier:
      "Tier 1",



      tierOrder:
      1,



      popularity:
      25,



      tournamentResults:
      15,



      trend:
      DeckTrend.up,



      format:
      "Speed Duel",



      description:
      "Deck competitivo basado en Blue Eyes.",



      wins:
      120,



      losses:
      30,



      cards:{


        create:[


          {

            cardId:
            blueEyesCard.id,

            quantity:
            3,

            zone:
            "main"

          },


          {

            cardId:
            mstCard.id,

            quantity:
            3,

            zone:
            "main"

          }


        ]

      }


    }


  });









  /*
    CREAR DARK MAGICIAN DECK
  */


  await prisma.deck.upsert({

    where:{

      deckHash:
      "dark-magician-001"

    },


    update:{


      name:
      "Dark Magician",


      archetypeId:
      darkMagicianArchetype.id,


      tier:
      "Tier 2",


      tierOrder:
      2,


      popularity:
      15,


      tournamentResults:
      8,


      trend:
      DeckTrend.stable,


      wins:
      80,


      losses:
      40


    },


    create:{


      name:
      "Dark Magician",



      slug:
      "dark-magician",



      deckHash:
      "dark-magician-001",



      archetypeId:
      darkMagicianArchetype.id,



      tier:
      "Tier 2",



      tierOrder:
      2,



      popularity:
      15,



      tournamentResults:
      8,



      trend:
      DeckTrend.stable,



      format:
      "Speed Duel",



      description:
      "Deck basado en el mago legendario.",



      wins:
      80,



      losses:
      40,



      cards:{


        create:[


          {

            cardId:
            darkMagicianCard.id,

            quantity:
            3,

            zone:
            "main"

          },


          {

            cardId:
            mstCard.id,

            quantity:
            2,

            zone:
            "main"

          }


        ]

      }


    }


  });








  /*
    COMPROBACION
  */


  const decks =
  await prisma.deck.findMany({

    include:{

      archetype:true,


      cards:{

        include:{

          card:true

        }

      }

    }

  });



  console.log(

    JSON.stringify(
      decks,
      null,
      2
    )

  );



  console.log(
    "Seed completado correctamente"
  );


}







main()

.catch((error)=>{

  console.error(error);

})


.finally(async()=>{

  await prisma.$disconnect();

});
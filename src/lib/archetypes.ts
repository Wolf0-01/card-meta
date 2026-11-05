import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";



/*
  INCLUDE BASE

  Datos que traeremos
  junto al arquetipo:

  - Decks asociados
  - Datos principales del deck
*/


const archetypeInclude: Prisma.ArchetypeInclude = {


  decks: {


    orderBy:[
  {
    popularity:"desc" as Prisma.SortOrder
  },
  {
    name:"asc" as Prisma.SortOrder
  }
],



    select:{


      id:true,


      name:true,


      slug:true,


      identifier:true,


      tier:true,


      popularity:true,


      wins:true,


      losses:true,


      tournamentResults:true



    }



  }



};









/*
  Obtener todos los arquetipos

  Uso:

  /archetypes

*/


export async function getAllArchetypes(){



  const archetypes = await prisma.archetype.findMany({



    orderBy:{


      name:"asc"


    },


    include:archetypeInclude



  });





  return archetypes;


}


/*
  Obtener arquetipo por slug

  Ejemplo:

  /archetypes/blue-eyes

*/


export async function getArchetypeBySlug(

  slug:string

){


  if(!slug){

    return null;

  }


  const archetype = await prisma.archetype.findUnique({


    where:{


      slug


    },


    include:archetypeInclude



  });


  return archetype;



}



/*
  Obtener arquetipo por ID

*/


export async function getArchetypeById(

  id:string

){



  if(!id){

    return null;

  }


  const archetype = await prisma.archetype.findUnique({


    where:{


      id


    },


    include:archetypeInclude



  });


  return archetype;



}



/*
  Buscar arquetipos

  Ej:

  Blue
  Dark
  Galaxy

*/


export async function searchArchetypes(

  search:string

){



  if(!search){

    return [];

  }

  return await prisma.archetype.findMany({



    where:{


      name:{


        contains:search,


        mode:"insensitive"


      }


    },



    orderBy:{


      name:"asc"


    },



    include:archetypeInclude



  });



}


/*
  Arquetipos destacados

  Similar a Featured Decks

  Ordenados por cantidad
  de decks asociados

*/


export async function getFeaturedArchetypes(){



  return await prisma.archetype.findMany({

    take:10,

    orderBy:{

      decks:{

        _count:"desc"

      }

    },

    include:archetypeInclude



  });



}



/*
  Obtener decks de un arquetipo

*/


export async function getDecksByArchetype(

  archetypeId:string

){



  if(!archetypeId){

    return [];

  }


  const decks = await prisma.deck.findMany({



    where:{


      archetypeId



    },


    orderBy:[
  {
    popularity:"desc" as Prisma.SortOrder
  },
  {
    tournamentResults:"desc" as Prisma.SortOrder
  },
  {
    wins:"desc" as Prisma.SortOrder
  }
],



  });


  return decks;



}



/*
  Contar decks asociados

*/


export function countArchetypeDecks(
archetype: {
decks?: unknown[];
} | null | undefined
) {
return archetype?.decks?.length ?? 0;
}

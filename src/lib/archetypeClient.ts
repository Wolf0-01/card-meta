import {
  DeckCard
} from "@/lib/deckStorage";


interface ArchetypeResult {

  id:string;

  name:string;

}


export function detectArchetype(
  cards:DeckCard[]
):ArchetypeResult | null {


  if(cards.length === 0){

    return null;

  }


  const names =
    cards.map(card =>
      card.name.toLowerCase()
    );



  if(
    names.some(name =>
      name.includes("blue-eyes") ||
      name.includes("blue eyes")
    )
  ){

    return {

      id:"blue-eyes",

      name:"Blue-Eyes"

    };

  }



  if(
    names.some(name =>
      name.includes("dark magician")
    )
  ){

    return {

      id:"dark-magician",

      name:"Dark Magician"

    };

  }



  return null;

}
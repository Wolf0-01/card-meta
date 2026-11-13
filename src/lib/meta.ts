import {
  MetaDeck
} from "@/types/meta";

import { getDuelFormatLabel } from "@/lib/duelFormat";



export function getMetaStats(

  decks:MetaDeck[]

){


  const totalDecks =
    decks.length;



  const averageWinRate =

    totalDecks === 0

    ?

    0

    :

    Math.round(

      decks.reduce(

        (
          total,
          deck

        ) =>

          total + deck.winRate,

        0

      )

      /

      totalDecks

    );




  const tournaments =

    decks.reduce(

      (
        total,
        deck

      ) =>

        total +

        (deck.tournamentResults ?? 0),

      0

    );




  return {


    totalDecks,


    averageWinRate,


    format:

      decks[0]
        ? getDuelFormatLabel(decks[0].format)
        : "Unknown",



    lastUpdate:

      decks[0]?.updatedAt ??

      new Date()
      .toISOString()
      .split("T")[0],



    tournaments,


    totalPlayers:4500


  };


}
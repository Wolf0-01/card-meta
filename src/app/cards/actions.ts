"use server";

import { prisma } from "@/lib/prisma";


export async function searchCards(
  query: string
) {

  const cards = await prisma.card.findMany({

    where: {

      name: {
        contains: query,
        mode: "insensitive",
      },

    },


    orderBy: {
      name: "asc",
    },


    take: 50,

  });


  return cards;

}
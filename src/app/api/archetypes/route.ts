import { NextResponse } from "next/server";

import {
  getAllArchetypes,
  searchArchetypes
} from "@/lib/archetypes";





export async function GET(
  request:Request
){


  try{


    const { searchParams } =

      new URL(request.url);



    const search =

      searchParams.get("search");







    const archetypes =

      search

      ?

      await searchArchetypes(search)

      :

      await getAllArchetypes();







    return NextResponse.json({

      archetypes

    });



  }

  catch(error){


    console.error(
      "Error API archetypes:",
      error
    );



    return NextResponse.json(

      {
        error:
          "Error obteniendo arquetipos"
      },

      {
        status:500
      }

    );


  }


}
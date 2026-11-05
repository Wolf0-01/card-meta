import Link from "next/link";


export default function Footer() {

  return (

    <footer
      className="
        mt-10
        border-t
        border-zinc-800
        bg-zinc-950
        px-6
        py-10
      "
    >

      <div
        className="
          mx-auto
          max-w-7xl
          grid
          grid-cols-1
          md:grid-cols-3
          gap-8
        "
      >


        {/* Branding */}

        <div>

          <h2
            className="
              text-xl
              font-bold
              text-white
            "
          >
            Card Meta
          </h2>


          <p
            className="
              mt-3
              text-zinc-400
            "
          >
            Comunidad de Duel Links para
            decks, cartas, torneos y meta competitivo.
          </p>

        </div>





        {/* Navegación */}

        <div>

          <h3
            className="
              font-semibold
              text-white
            "
          >
            Explorar
          </h3>


          <div
            className="
              mt-3
              flex
              flex-col
              gap-2
              text-zinc-400
            "
          >

            <Link
              href="/cards"
              className="hover:text-white transition"
            >
              Cards
            </Link>


            <Link
              href="/decks"
              className="hover:text-white transition"
            >
              Decks
            </Link>


            <Link
              href="/tier-list"
              className="hover:text-white transition"
            >
              Tier List
            </Link>


            <Link
              href="/tournaments"
              className="hover:text-white transition"
            >
              Tournaments
            </Link>


          </div>

        </div>





        {/* Comunidad */}

        <div>

          <h3
            className="
              font-semibold
              text-white
            "
          >
            Comunidad
          </h3>


          <p
            className="
              mt-3
              text-zinc-400
            "
          >
            Mantente actualizado con las
            novedades del meta.
          </p>


        </div>


      </div>





      <div
        className="
          mx-auto
          mt-8
          max-w-7xl
          border-t
          border-zinc-800
          pt-5
          text-center
          text-sm
          text-zinc-500
        "
      >

        © 2026 Card Meta. Todos los derechos reservados.

      </div>


    </footer>

  );

}
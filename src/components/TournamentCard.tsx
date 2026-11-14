import Link from "next/link";


export default function TournamentCard() {

  return (

    <Link

      href="/tournaments"

      className="
        group
        block
        rounded-xl
        border
        border-zinc-800
        bg-zinc-900
        p-5
        transition
        hover:-translate-y-1
        hover:border-green-500
        hover:shadow-lg
        hover:shadow-green-500/10
      "

    >


      <div
        className="
          mb-3
          inline-flex
          rounded-full
          bg-green-500/10
          px-3
          py-1
          text-xs
          font-semibold
          text-green-400
        "
      >
        UPCOMING
      </div>



      <h3
        className="
          text-xl
          font-bold
          text-white
        "
      >
        🏆 Tournament
      </h3>



      <p
        className="
          mt-3
          text-zinc-400
        "
      >
        Official competition for Duel Links
        players.
      </p>




      <div
        className="
          mt-4
          space-y-2
          text-sm
          text-zinc-300
        "
      >

        <p>
          📅 Date: Coming soon
        </p>

        <p>
          🎴 Format: Competitive
        </p>

      </div>




      <div
        className="
          mt-5
          text-sm
          font-semibold
          text-green-400
          transition
          group-hover:text-green-300
        "
      >
        View tournament →
      </div>



    </Link>

  );

}
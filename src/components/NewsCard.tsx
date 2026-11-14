import Link from "next/link";


export default function NewsCard() {

  return (

    <Link

      href="/news"

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
        hover:border-blue-500
        hover:shadow-lg
        hover:shadow-blue-500/10
      "

    >


      <div
        className="
          mb-3
          inline-flex
          rounded-full
          bg-blue-500/10
          px-3
          py-1
          text-xs
          font-semibold
          text-blue-400
        "
      >
        UPDATE
      </div>



      <h3
        className="
          text-xl
          font-bold
          text-white
        "
      >
        📰 New update
      </h3>



      <p
        className="
          mt-3
          text-zinc-400
        "
      >
        New cards arrive in the game and
        reshape the competitive meta.
      </p>




      <div
        className="
          mt-5
          text-sm
          font-semibold
          text-blue-400
          transition
          group-hover:text-blue-300
        "
      >
        Read article →
      </div>


    </Link>

  );

}
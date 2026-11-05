import DeckBuilder from "@/components/decks/DeckBuilder";


export default function DecksPage() {

  return (

    <main
      className="
        p-6
      "
    >

      <h1
        className="
          text-3xl
          font-bold
          mb-6
        "
      >

        Mi Deck Duel Links

      </h1>


      <DeckBuilder />


    </main>

  );

}
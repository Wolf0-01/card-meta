interface CardInfoProps {

  name: string;

  type: string;

  rarity: string | null;

  attribute: string | null;

}


export default function CardInfo({

  name,
  type,
  rarity,
  attribute,

}: CardInfoProps) {


  const isSpellOrTrap =
    type === "Spell Card" ||
    type === "Trap Card";


  return (

    <div>


      <h2
        className="
          text-xl
          font-bold
        "
      >
        {name}
      </h2>



      <p className="text-zinc-300 mt-2">
        Tipo: {type}
      </p>



      {
        !isSpellOrTrap && (

          <>


            <p className="text-zinc-300">
              Atributo: {attribute ?? "N/A"}
            </p>



            <p className="text-zinc-300">
              Rareza: {rarity ?? "N/A"}
            </p>


          </>

        )
      }


    </div>

  );

}
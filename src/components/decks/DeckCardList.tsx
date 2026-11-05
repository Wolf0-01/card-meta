"use client";


import Image from "next/image";



type DeckZone =
  | "main"
  | "extra"
  | "side";





interface DeckCard {


  id:string;


  quantity:number;


  zone:DeckZone;



  card:{

    id:number;

    name:string;

    image:string | null;

    type?:string;

  };


}







interface Props {

  cards:DeckCard[];

}









export default function DeckCardList({

  cards

}:Props){





if(!cards || cards.length === 0){

  return null;

}









return (


<section

className="
mt-6
bg-zinc-900
border
border-zinc-800
rounded-2xl
p-6
"

>


<h2

className="
text-2xl
font-bold
mb-5
text-white
"

>

🃏 Cartas del Deck

</h2>









<div

className="
grid
grid-cols-2
sm:grid-cols-3
md:grid-cols-4
lg:grid-cols-6
gap-4
"

>





{

cards.map(item=>(



<div

key={item.id}

className="
bg-zinc-950
border
border-zinc-800
rounded-xl
p-3
hover:border-blue-500
transition
"

>






<div

className="
relative
"

>


<Image

src={
item.card.image ??
"/cards/default.jpg"
}

alt={item.card.name}

width={120}

height={170}

unoptimized

className="
rounded-lg
w-full
h-auto
object-cover
"

/>



{

item.quantity > 1 &&

<span

className="
absolute
top-2
right-2
bg-blue-600
text-white
text-xs
font-bold
rounded-full
px-2
py-1
"

>

x{item.quantity}

</span>

}


</div>









<p

className="
mt-3
text-sm
font-semibold
text-white
line-clamp-2
"

>

{item.card.name}

</p>







<div

className="
mt-2
flex
justify-between
text-xs
text-zinc-500
uppercase
"

>

<span>

{item.zone}

</span>



{

item.card.type &&

<span>

{item.card.type}

</span>

}



</div>








</div>



))


}







</div>







</section>


);


}
"use client";


import Link from "next/link";


import {
  MetaDeck,
  Trend
} from "@/types/meta";



interface Props {

  deck:MetaDeck;

  badge:string;

}






function TrendBadge({

trend

}:{

trend?:Trend

}){


if(trend==="up"){

return (

<span className="
text-green-400
font-bold
">

↑ Rising

</span>

);

}




if(trend==="down"){

return (

<span className="
text-red-400
font-bold
">

↓ Falling

</span>

);

}




return (

<span className="
text-zinc-400
">

→ Stable

</span>

);


}







export default function DeckMetaCard({

deck,

badge

}:Props){



return (


<Link

href={`/meta/${deck.identifier}`}

className="
block
bg-zinc-950
border
border-zinc-700
rounded-xl
p-5
hover:border-blue-500
transition
"

>




<div

className="
flex
justify-between
items-start
mb-3
"

>


<div>


<h3

className="
text-xl
font-bold
text-white
"

>

{deck.archetype?.name ?? "Unknown"}

</h3>



<p

className="
text-sm
text-zinc-400
"

>

{deck.name}

</p>



</div>






<span

className={`
px-3
py-1
rounded-full
text-xs
font-bold
${badge}
`}

>

{deck.tier ?? "Rogue"}

</span>



</div>









<p

className="
text-xs
text-zinc-500
mb-4
line-clamp-2
"

>

{deck.description ??

"Deck competitivo del meta actual."}

</p>









<div

className="
grid
grid-cols-3
gap-3
text-center
"

>





<div>

<p className="
text-xs
text-zinc-500
">

META

</p>


<p className="
font-bold
text-white
">

{deck.popularity}%

</p>


</div>








<div>

<p className="
text-xs
text-zinc-500
">

WIN RATE

</p>


<p className="
font-bold
text-white
">

{deck.winRate ?? 0}%

</p>


</div>








<div>

<p className="
text-xs
text-zinc-500
">

CARDS

</p>


<p className="
font-bold
text-white
">

{deck.totalCards ?? 0}

</p>


</div>






</div>









<div

className="
mt-5
flex
justify-between
items-center
"

>


<TrendBadge

trend={deck.trend}

/>





<span

className="
text-blue-400
text-sm
font-semibold
"

>

Ver Deck →

</span>



</div>





</Link>


);


}
"use client";


const decks=[

{
name:"Branded Despia",
wins:"82%"
},

{
name:"Dragon Link",
wins:"78%"
},

{
name:"Cyber Dragon",
wins:"74%"
},

{
name:"Blue Eyes",
wins:"70%"
}

];


export default function TopDeck(){


return (

<section

className="
bg-zinc-900
border
border-zinc-800
rounded-xl
p-6
"

>


<h2

className="
text-2xl
font-bold
mb-5
"

>

Top Deck

</h2>



<div

className="
space-y-3
"

>


{

decks.map((deck,index)=>(


<div

key={deck.name}

className="
flex
justify-between
items-center
bg-zinc-800
rounded-lg
p-3
"

>


<div>


<span

className="
font-bold
mr-3
"

>

#{index+1}

</span>


{deck.name}


</div>



<span

className="
text-green-400
font-bold
"

>

{deck.wins}

</span>


</div>


))

}


</div>



</section>


);


}
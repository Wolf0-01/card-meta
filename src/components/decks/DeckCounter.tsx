interface Props {

  total:number;

  max?:number;

  min?:number;

}



export default function DeckCounter({

  total,

  max=30,

  min=20

}:Props){



const percentage =

Math.min(

(total / max) * 100,

100

);



const valid =

total >= min &&

total <= max;



return (


<div

className="

space-y-2

"

>


<div

className="

h-2

w-full

rounded-full

bg-zinc-800

overflow-hidden

"

>


<div

className={

`

h-full

transition-all

duration-300

${

valid

?

"bg-green-500"

:

"bg-red-500"

}

`

}

style={{

width:`${percentage}%`

}}

/>


</div>





<div

className="

flex

justify-between

text-xs

"

>


<span

className="

text-zinc-400

"

>

Cartas del Deck:

<strong

className="

ml-1

text-white

"

>

{total}/{max}

</strong>

</span>





{

valid

?


<span

className="

text-green-400

"

>

✓ Correcto

</span>


:


<span

className="

text-red-400

"

>


{

total < min

?

`Faltan ${min-total}`

:

`Sobran ${total-max}`

}


</span>


}



</div>


</div>


);


}
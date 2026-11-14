"use client";


import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";



export default function CardSearch() {


  const router = useRouter();


  const searchParams =
    useSearchParams();



  const [value,setValue] =
    useState(
      searchParams.get("search") ?? ""
    );



  useEffect(()=>{


    const timer =
      setTimeout(()=>{


        const search = value.trim();


if(search.length >= 3){

  router.push(
    `/cards?search=${encodeURIComponent(search)}`
  );


}else if(search.length === 0){

  router.push("/cards");

}


      },300);



    return () =>
      clearTimeout(timer);



  },[value,router]);




  return (

    <input

      value={value}

      placeholder="Search card..."

      onChange={(e)=>
        setValue(e.target.value)
      }


      className="
        w-full
        p-3
        mb-8
        rounded-xl
        bg-zinc-800
        text-white
        border
        border-zinc-700
        outline-none
        focus:border-blue-500
      "

    />

  );

}
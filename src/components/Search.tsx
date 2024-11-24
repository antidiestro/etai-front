import { useRef } from "react";
import { useAppContext } from "../contexts/AppContext";
import preventWidows from "../scripts/preventWidows";
import Suggestions from "./Suggestions";

export default function Search() {
  const { setQuery } = useAppContext();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex-1 flex flex-col justify-center -mt-16">
      <div className="text-orange-600 text-[32px] leading-tight mb-6 sm:text-center sm:mb-10">
        {preventWidows("What do you want to learn today?") + " 🤓"}
      </div>
      <form
        className="w-full mx-auto max-w-xl mb-6 sm:mb-10"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(inputRef.current?.value || "");
        }}
      >
        <input
          className="w-full bg-white border border-zinc-400/30 placeholder-zinc-400 rounded-lg h-[52px] shadow-xl shadow-zinc-600/5 px-4 focus:outline-black sm:h-[64px] sm:px-5 sm:text-lg"
          placeholder="Ask a question or enter any topic..."
          ref={inputRef}
          type="text"
          autoFocus
        />
      </form>
      <Suggestions />
    </div>
  );
}

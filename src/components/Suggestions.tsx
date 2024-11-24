import { useState } from "react";
import suggestions from "../suggestions-english.json";
import { shuffleArray } from "./AppearingTextRandomizer";
import { useAppContext } from "../contexts/AppContext";

const SuggestionsTerm = ({ term }: { term: string }) => {
  const { setQuery } = useAppContext();

  return (
    <a
      key={term}
      href="#"
      onClick={() => setQuery(term.split(" ").slice(1).join(" "))}
      className="flex shrink-0 text-sm  text-neutral-700 hover:opacity-80 rounded-full m-1 hover:no-underline"
    >
      {term}
    </a>
  );
};

export default function Suggestions() {
  const [terms] = useState(shuffleArray(suggestions.terms));

  const thirdLength = Math.ceil(terms.length / 2);

  const termGroups = [
    terms.slice(0, thirdLength),
    terms.slice(thirdLength, thirdLength * 2),
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 overflow-x-auto p-6 no-scrollbar sm:hidden">
        {termGroups.map((group, index) => (
          <div key={index} className="flex gap-x-3 gap-y-2 mt-1">
            {group.map((term) => (
              <SuggestionsTerm key={term} term={term} />
            ))}
          </div>
        ))}
      </div>
      <div className="absolute bottom-10 hidden sm:flex flex-wrap justify-center gap-2 gap-x-3 mt-6">
        {terms.slice(0, 6).map((term) => (
          <SuggestionsTerm key={term} term={term} />
        ))}
      </div>
    </>
  );
}

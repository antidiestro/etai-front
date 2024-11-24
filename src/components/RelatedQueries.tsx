import { useAppContext } from "../contexts/AppContext";

export default function RelatedQueries() {
  const { results, setQuery } = useAppContext();

  const relatedQueries = results?.summary.related_queries ?? [];

  return (
    relatedQueries.length && (
      <div>
        <h2>Dive Deeper</h2>
        <div className="-mt-2 mb-5">
          Continue your research with related questions and topics.
        </div>
        <div className="flex flex-wrap gap-3 gap-y-2 pb-4">
          {relatedQueries.slice(0, 4).map((query) => (
            <div
              onClick={() => setQuery(query)}
              key={query}
              className="bg-orange-600 flex items-center gap-1.5 rounded-full px-3 py-1 hover:opacity-90 cursor-pointer text-white truncate text-[15px]"
            >
              <span className="font-medium">{query}</span>
              <span className="material-symbols-sharp text-[20px]">
                arrow_outward
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  );
}

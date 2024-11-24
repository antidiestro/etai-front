import React, { useState, useRef, useCallback } from "react";
import { useQuery } from "react-query";
import "./App.css";
import ReactMarkdown from "react-markdown";
import getWorksStats from "./scripts/processArticles";
import type { AnalysisResult } from "./scripts/processArticles";
import CitationLink from "./components/CitationLink";
import PublicationDetailsModal from "./components/PublicationDetailsModal";
import AppearingTextRandomizer from "./components/AppearingTextRandomizer";

interface Institution {
  institution_ids: string[];
  raw_affiliation_string: string;
}

interface Author {
  display_name: string;
  id: string;
  orcid?: string;
}

export interface Authorship {
  affiliations: Institution[];
  author: Author;
  author_position: string;
  countries: string[];
  institutions: object[];
  is_corresponding: boolean;
  raw_affiliation_strings: string[];
  raw_author_name: string;
}

export interface Publication {
  authorships: Authorship[];
  cited_by_count: number;
  doi: string;
  pub_date: string;
  pub_year: number;
  title: string;
}

interface Finding {
  summary: string;
  title: string;
}

const fetchSearchResults = async (query: string) => {
  console.log("search");
  const response = await fetch(
    `https://etai-backend-537a5149f0b1.herokuapp.com/query?question=${query}`
  );
  if (!response.ok) {
    throw new Error("Error fetching search results");
  }
  return response.json();
};

const fetchFacts = async (query: string) => {
  const response = await fetch(
    `https://etai-backend-537a5149f0b1.herokuapp.com/facts?question=${query}`
  );
  if (!response.ok) {
    throw new Error("Error fetching search results");
  }
  return response.json();
};

function App() {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [workStats, setWorkStats] = useState<null | AnalysisResult>(null);
  const [openDropdowns, setOpenDropdowns] = useState<Finding["title"][]>([]);
  const [openPublication, setOpenPublication] = useState<Publication | null>(
    null
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const toggleDropdown = (index: Finding["title"]) => {
    if (openDropdowns.includes(index)) {
      setOpenDropdowns(openDropdowns.filter((id) => id !== index));
    } else {
      setOpenDropdowns([...openDropdowns, index]);
    }
  };

  const { data, refetch, isLoading } = useQuery(
    ["searchSummary"],
    () => fetchSearchResults(inputRef.current?.value || ""),
    {
      enabled: false,
    }
  );

  const { data: factsData, refetch: refetchFacts } = useQuery(
    ["searchFacts"],
    () => fetchFacts(inputRef.current?.value || ""),
    {
      enabled: false,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRef.current) {
      refetchFacts();
      setTimeout(() => {
        refetch().then(() => {
          getWorksStats(data?.keywords?.join(" OR ")).then((result) => {
            setWorkStats(result);
          });
        });
      }, 500);
    }
  };

  const facts = factsData?.facts;
  const summary = data?.summary;
  const showInput = !(data || isLoading);
  const showButton = !showInput && !isLoading;
  const bibliography: Publication[] | undefined = data?.works_partial;

  const mappedAnchorComponent = useCallback(
    (props: JSX.IntrinsicElements["a"]) => (
      <CitationLink
        {...props}
        onCitationClick={(doi) => {
          const publication = bibliography?.find((pub) => pub.doi === doi);
          if (publication) setOpenPublication(publication);
        }}
      />
    ),
    [bibliography]
  );

  return (
    <div id="results">
      {showInput && (
        <div>
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              value={input}
              onChange={handleInput}
              placeholder="Por qué el cilantro es tan rico"
            />
            <button type="submit">Buscar</button>
          </form>
        </div>
      )}
      {showButton && (
        <button onClick={() => window.location.reload()}>Nueva búsqueda</button>
      )}
      {isLoading && (
        <div>
          {facts ? (
            <div>
              <AppearingTextRandomizer
                facts={facts}
                rotateInterval={1800}
                timeBetweenChars={60}
              />
            </div>
          ) : (
            "Loading..."
          )}
        </div>
      )}
      {summary && (
        <div>
          <div>
            <h1>
              {summary.query_answer ? summary.clean_query : summary.title}
            </h1>
            <ReactMarkdown
              components={{
                a: mappedAnchorComponent,
              }}
            >
              {summary.query_answer
                ? summary.query_answer
                : summary.introduction_summary}
            </ReactMarkdown>
          </div>

          <div>
            <h3>Hallazgos clave</h3>
            {summary.key_findings.map((finding: Finding) => (
              <div
                key={finding.title}
                onClick={() => toggleDropdown(finding.title)}
              >
                <h4>{finding.title}</h4>
                {openDropdowns.includes(finding.title) && (
                  <p>
                    <ReactMarkdown
                      components={{
                        a: mappedAnchorComponent,
                      }}
                    >
                      {finding.summary}
                    </ReactMarkdown>
                  </p>
                )}
              </div>
            ))}
          </div>

          <div>
            <h2>Quizás te puede interesar:</h2>
            <div>
              {summary.related_queries.map((question: string) => (
                <p key={question}>{question}</p>
              ))}
            </div>
          </div>
        </div>
      )}
      {workStats && (
        <div>
          <div>
            <h2>¿Dónde se investiga más este tema?</h2>
            <div>
              {Object.entries(workStats.countryDistribution)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([country, count]) => (
                  <div key={country}>
                    <p>
                      {country} ({count})
                    </p>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <h2>¿Quiénes investigan más sobre este tópico?</h2>
            <div>
              {workStats.topAuthors.slice(0, 5).map((author) => (
                <div key={author.id}>
                  <p>
                    {author.display_name} ({author.count})
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2>¿Y en qué universidades?</h2>
            <div>
              {workStats.topInstitutions.slice(0, 5).map((institution) => (
                <div key={institution.id}>
                  <a href={institution.id}>
                    <p>
                      {institution.display_name} ({institution.count})
                    </p>
                  </a>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2>¿Cuándo se investigó más sobre este tópico?</h2>
            <div>
              {/* {Object.entries(workStats.yearDistribution)
                .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                .map(([year, count]) => (
                  <div key={year}>
                    <p>
                      {year} ({count})
                    </p>
                  </div>
                ))} */}
            </div>
          </div>
        </div>
      )}
      {bibliography && (
        <div>
          <h2>Bibliografía</h2>
          <ul>
            {bibliography.slice(0, 10).map((publication: Publication) => {
              const author =
                publication.authorships.find(
                  (authorship: Authorship) =>
                    authorship.author_position === "first"
                ) || publication.authorships[0];
              if (!author) return null;
              return (
                <li key={publication.doi}>
                  <a href={""}>{publication.title}</a>
                  <p>
                    {[
                      author.raw_author_name +
                        (publication.authorships.length > 1 && "  et al."),
                      publication.pub_year && publication.pub_year,
                      publication.cited_by_count &&
                        `Citado por ${publication.cited_by_count}`,
                    ].join(" · ")}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {openPublication && (
        <PublicationDetailsModal
          publication={openPublication}
          onClose={() => setOpenPublication(null)}
        />
      )}
    </div>
  );
}

export default App;

import React, { FC, useContext, useEffect, useState } from "react";
import { RouteComponentProps, navigate } from "@reach/router";
import { PokemonContext } from "../../context/PokemonContext";
import { MovesContext } from "../../context/MovesContext";
import { Grid, Button } from "@material-ui/core";
import PokemonCard from "../PokemonCard/PokemonCard";
import TypeButtons from "../TypeButtons/TypeButtons";
import VersionButtons from "../VersionButtons/VersionButtons";
import LearnMethodButtons from "../LearnMethodButtons/LearnMethodButtons";
import FilterSelectionDisplay from "../FilterSelectionDisplay/FilterSelectionDisplay";
import Loading from "../Loading/Loading";
import { Pokemon } from "../../types";

type FilterState = {
  moves: string[];
  pokemonType: string;
  version: string;
  learnMethod: string;
};

const containerStyle = {
  display: "flex",
  flexWrap: "wrap" as "wrap",
};

const buttonStyle = {
  margin: "0 1rem 0 1rem",
};

const buttonContainerStyle = {
  display: "flex",
  margin: "1rem 0 2rem 0",
};

const noResultsContainerStyle = {
  display: "flex",
  width: "50%",
  margin: "auto",
  padding: "5rem",
};

const initialFilterState = {
  moves: [],
  pokemonType: null,
  version: null,
  learnMethod: null,
};

const initialDisplayState = {
  id: 0,
  name: "",
  moves: [],
  types: [],
};

const PokemonResults: FC<RouteComponentProps> = (props: RouteComponentProps) => {
  const { pokemonState } = useContext(PokemonContext);
  const {
    selectedMovesState: { selectedMoves },
  } = useContext(MovesContext);

  const [displayedPokemon, setDisplayedPokmeon] = useState<Pokemon[]>([initialDisplayState]);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  useEffect(() => runMovesFilter(), [pokemonState, selectedMoves]);

  useEffect(() => {
    console.log("filtered results ==> ", displayedPokemon);
  }, [displayedPokemon]);

  const runMovesFilter = () => {
    if (pokemonState.length && selectedMoves.length) {
      const initialDisplayData = pokemonState.filter((pokemon) => {
        return selectedMoves.every((move) => pokemon.moves.hasOwnProperty(move.name));
      });
      setDisplayedPokmeon(initialDisplayData);
    }

    setFilters({
      ...initialFilterState,
      moves: selectedMoves.map((selectedMove) => selectedMove.name),
    });
  };

  const applyTypeFilter = (pokemonType: string, displayText: string) => {
    const results = displayedPokemon.filter((pokemon) => pokemon.types.includes(pokemonType.toLowerCase()));
    setDisplayedPokmeon(results);
    setFilters({
      ...filters,
      pokemonType: displayText,
    });
  };

  const applyVersionFilter = (version: string, displayText: string) => {
    const results = displayedPokemon.filter(({ moves: movesForPokemon }: Pokemon) => {
      return selectedMoves.every(({ name: moveName }) => {
        return movesForPokemon[moveName].versionData.some((versionObj) => versionObj.version === version);
      });
    });
    setDisplayedPokmeon(results);
    setFilters({
      ...filters,
      version: displayText,
    });
  };

  const applyLearnMethodFilter = (learnMethod: string, displayText: string) => {
    const results = displayedPokemon.filter(({ moves: movesForPokemon }: Pokemon) => {
      return selectedMoves.every(({ name: moveName }) => {
        return movesForPokemon[moveName].versionData.some((verionObj) => verionObj.learnMethod === learnMethod);
      });
    });
    setDisplayedPokmeon(results);
    setFilters({
      ...filters,
      learnMethod: displayText,
    });
  };

  const goBack = () => {
    navigate(-1);
  };

  const renderPokemonCards = () => {
    if (displayedPokemon.length === 1 && displayedPokemon[0].id === 0) {
      return <Loading />;
    }

    if (!displayedPokemon.length) {
      return (
        <div style={noResultsContainerStyle}>
          <span>No Results for current Filters</span>
          <Button variant={"contained"} color="primary" onClick={goBack} style={buttonStyle}>
            Back to Search
          </Button>
          <Button variant={"outlined"} color="secondary" onClick={runMovesFilter} style={buttonStyle}>
            Remove Filters
          </Button>
        </div>
      );
    }

    return (
      <div style={containerStyle}>
        {displayedPokemon.map((pokemon) => (
          <PokemonCard pokemon={pokemon} key={pokemon.id} />
        ))}
      </div>
    );
  };

  return (
    <>
      <div style={buttonContainerStyle}>
        <Button variant={"contained"} color="primary" onClick={goBack} style={buttonStyle}>
          Back to Search
        </Button>
        <FilterSelectionDisplay filters={filters} />
        {filters.pokemonType || filters.version || filters.learnMethod ? (
          <Button variant={"outlined"} color="secondary" onClick={runMovesFilter} style={buttonStyle}>
            Remove Filters
          </Button>
        ) : null}
      </div>
      <Grid container>
        <Grid item xs={3}>
          <TypeButtons selectType={applyTypeFilter} />
        </Grid>
        <Grid item xs={6}>
          <VersionButtons selectVersion={applyVersionFilter} />
        </Grid>
        <Grid item xs={2}>
          <LearnMethodButtons selectLearnMethod={applyLearnMethodFilter} />
        </Grid>
      </Grid>
      {renderPokemonCards()}
    </>
  );
};

export default PokemonResults;

import { useNavigate } from "react-router-dom";
import { IFilm, IHall, ISeance } from "../../models";
import "./Film.scss";

interface IMovie {
  films: IFilm[];
  halls: IHall[];
  seances: ISeance[];
  selectedDate: string | null;
}

export const Movie: React.FC<IMovie> = ({
  films,
  halls,
  seances,
  selectedDate,
}) => {
  const navigate = useNavigate();

  const processSeanceSelection = (seanceId: number) => {
    const foundSeance = seances.find((seance) => seance.id === seanceId);
    const foundFilm = films.find(
      (film) => film.id === foundSeance?.seance_filmid
    );
    const foundHall = halls.find(
      (hall) => hall.id === foundSeance?.seance_hallid
    );

    if (!foundSeance || !foundFilm || !foundHall) {
      console.error("Ошибка: не найдены данные для сеанса");
      return;
    }

    sessionStorage.setItem(
      "selectedSeanceInfo",
      JSON.stringify({
        seance: foundSeance,
        film: foundFilm,
        hall: foundHall,
        selectedDate,
      })
    );

    navigate(`/movies/${seanceId}`);
  };

  return (
    <div className="movie">
      {films.map((film) => (
        <div className="movie__container p-3" key={film.id}>
          <div className="movie__content">
            <img
              src={film.film_poster}
              alt={film.film_name}
              className="movie__picture"
            />
            <div className="movie__picture-figure"></div>
            <div className="movie__tittle">
              <h3 className="movie__tittle-heading">{film.film_name}</h3>
              <p className="movie__tittle-description">
                {film.film_description}
              </p>
              <p className="movie__tittle-movie-time">
                {film.film_duration} минут {film.film_origin}
              </p>
            </div>
          </div>
          <div className="movie__halls">
            {halls.map((hall) => {
              const filteredSeances = seances.filter(
                (seance) =>
                  seance.seance_filmid === film.id &&
                  seance.seance_hallid === hall.id &&
                  hall.hall_open === 1
              );
              if (filteredSeances.length === 0) return null;
              return (
                <div key={hall.id} className="movie__halls-tittle">
                  <h4 className="movie__halls-tittle-heading">
                    Зал: {hall.hall_name}
                  </h4>
                  <div className="movie__halls-seance">
                    {filteredSeances.map((seance) => (
                      <button
                        key={seance.id}
                        onClick={() => processSeanceSelection(seance.id)}
                        className="movie__halls-seance-time"
                      >
                        {seance.seance_time}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
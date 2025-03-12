import { useState } from "react";
import { MovieCard } from "./MovieCard";
import { TimeLine } from "./TimeTracker";
import { NewSessionModal } from "./NewSessionModal";
import { DeleteConfirmation } from "./DeleteConfirmation";
import { IFilm, IHall, ISeance } from "../../models";
import { useDrop } from "react-dnd";
import "./_sessionGrid.scss";

interface SessionGridProps {
  halls: IHall[];
  films: IFilm[];
  seances: ISeance[];
  setSeances: (seances: ISeance[]) => void;
  setFilms: (films: IFilm[]) => void;
  onSave: () => void;
}

export const SessionGrid: React.FC<SessionGridProps> = ({
  halls,
  films,
  seances,
  setSeances,
  setFilms,
  onSave,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [sessionData, setSessionData] = useState<null | {
    action: "add" | "delete";
    seanceId?: number;
    hallId?: number;
    filmName?: string;
    filmId?: number;
  }>(null);

  const [, dropRef] = useDrop({
    accept: "film",
    drop: (item: { filmId: number }, monitor) => {
      const dropLocation = monitor.getDropResult() as { hallId: number } | null;
      if (dropLocation?.hallId) {
        setSessionData({
          action: "add",
          filmId: item.filmId,
          hallId: dropLocation.hallId,
        });
        setModalOpen(true);
      }
    },
  });

  const addSeanceHandler = async (time: string) => {
    if (!sessionData?.filmId || !sessionData?.hallId) return;
    const film = films.find((f) => f.id === sessionData.filmId);
    if (!film) {
      setErrorMsg("Фильм не найден");
      return;
    }

    const filmDuration = film.film_duration;
    const [hours, minutes] = time.split(":" ).map(Number);
    const startTime = hours * 60 + minutes;
    const endTime = startTime + filmDuration;

    if (endTime > 1439) {
      setErrorMsg("Сеанс заканчивается после 23:59");
      return;
    }

    const params = new FormData();
    params.set("seanceHallid", sessionData.hallId.toString());
    params.set("seanceFilmid", sessionData.filmId.toString());
    params.set("seanceTime", time);

    try {
      setLoading(true);
      setErrorMsg("");

      const response = await fetch("https://shfe-diplom.neto-server.ru/seance", {
        method: "POST",
        body: params,
      });

      const data = await response.json();

      if (data.success) {
        setSeances(data.result.seances);
        setModalOpen(false);
        setSessionData(null);
        onSave();
      } else {
        setErrorMsg(data.error);
      }
    } catch (error) {
      console.log("Ошибка при добавлении сеанса", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSeanceHandler = async () => {
    if (!sessionData?.seanceId) return;
    try {
      const response = await fetch(
        `https://shfe-diplom.neto-server.ru/seance/${sessionData.seanceId}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (data.success) {
        setSeances(data.result.seances);
        setSessionData(null);
        setModalOpen(false);
        onSave();
      }
    } catch (error) {
      console.error("Ошибка при удалении сеанса", error);
    }
  };

  return (
    <div className="session-grid">
      <div className="film-list">
        {films.map((film) => (
          <MovieCard key={film.id} film={film} onDeleteFilm={() => setFilms(films.filter((f) => f.id !== film.id))} />
        ))}
      </div>
      <div className="timeline-container" ref={dropRef}>
        {halls.map((hall) => (
          <TimeLine
            key={hall.id}
            hall={hall}
            films={films}
            seances={seances.filter((s) => s.seance_hallid === hall.id)}
            setModalData={setSessionData}
            setIsModalOpen={setModalOpen}
          />
        ))}
      </div>
      {sessionData?.action === "delete" && (
        <DeleteConfirmation
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={deleteSeanceHandler}
          filmName={sessionData?.filmName || ""}
        />
      )}
      {sessionData?.action === "add" && (
        <NewSessionModal
          error={errorMsg}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setErrorMsg("");
          }}
          onAdd={addSeanceHandler}
          filmName={films.find((f) => f.id === sessionData?.filmId)?.film_name || ""}
          hallName={halls.find((h) => h.id === sessionData?.hallId)?.hall_name || ""}
          isSubmitting={loading}
        />
      )}
    </div>
  );
};
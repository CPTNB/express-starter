import { Ok } from 'ts-results-es';
import { FernApi } from "../api";
import type { ImdbServiceMethods } from "../api/generated/api/resources/imdb/service/ImdbService";
import { ImdbService } from "../api/generated/api/resources/imdb/service/ImdbService";
import { MovieId } from "../api/generated/api/resources/imdb/types/MovieId";
import {
    createServiceMethodsFromHandlers,
    defineServiceHandlers,
} from "../handlers";

export function createIMDBService() {
    const routeHandlers = defineServiceHandlers<ImdbServiceMethods>({
      getMovie: async ({ params }) => {
        if (params.movieId === "goodwill-hunting") {
            return Ok({
              id: MovieId(params.movieId),
              title: "Goodwill Hunting",
              rating: 4.9,
            });
          } else {
            throw new FernApi.MovieDoesNotExistError();
          }
      },
      createMovie: async ({ body }) => {
        const id = body.title.toLowerCase().replaceAll(" ", "-");

        // TODO, add movie to database
        console.log(body.externalId);
        return Ok({
            id: MovieId(id),
            title: body.title,
            rating: body.rating,
        })
      },
    });
    return new ImdbService(createServiceMethodsFromHandlers(routeHandlers));
  }
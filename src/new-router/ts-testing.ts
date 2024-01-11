function createOptions<TReturn, TQuery, TBody>(
  options:
    | {
        handler: () => TReturn;
        query?: undefined;
        body?: undefined;
      }
    | {
        handler: (opts: { query: TQuery; body: TBody }) => TReturn;
        query: TQuery;
        body: TBody;
      }
    | {
        handler: (opts: { query: TQuery; body: undefined }) => TReturn;
        query: TQuery;
        body?: undefined;
      }
    | {
        handler: (opts: { query: undefined; body: TBody }) => TReturn;
        query?: undefined;
        body: TBody;
      }
) {
  return options;
}

const opts = createOptions({ handler: ({}) => 1, body: { test: 1 } });

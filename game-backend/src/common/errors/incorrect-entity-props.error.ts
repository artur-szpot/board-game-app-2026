export class IncorrectEntityProps extends Error {
  constructor(errorMessage: string) {
    super();
    this.message = `Entity props could not be parsed correctly. Encountered errors: ${errorMessage}`;
  }
}

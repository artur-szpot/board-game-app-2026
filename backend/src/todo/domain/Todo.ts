// export interface TodoProps extends EntityProps {
//   title: string;
//   // TODO: add other fields
// }

// export class Todo extends Entity<TodoProps> {
//   public static fromDto(dto: TodoDto): Todo {
//     return new Todo({
//       id: dto.id,
//       title: dto.title,
//     });
//   }

//   public toString(): string {
//     return `Todo: ${this.props.title} (ID ${this.props.id})`;
//   }
// }

export class Todo {}

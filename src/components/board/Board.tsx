import { getBoardData } from "@/lib/tasks/queries";
import { Column } from "./Column";

export async function Board() {
  const data = await getBoardData();

  if (!data) {
    return <p className="p-4 text-gray-600 dark:text-gray-400">Sign in to view the board.</p>;
  }

  const columnSummaries = data.columns.map((column) => ({ id: column.id, name: column.name }));

  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {data.columns.map((column) => (
        <Column
          key={column.id}
          column={column}
          tasks={data.tasks.filter((task) => task.column_id === column.id)}
          columns={columnSummaries}
          profiles={data.profiles}
        />
      ))}
    </div>
  );
}

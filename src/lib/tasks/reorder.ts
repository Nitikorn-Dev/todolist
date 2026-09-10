/**
 * Pure drag & drop reorder logic. Operates on ordered lists of task ids
 * (already sorted by position) so it can be unit tested without a database,
 * and reused as-is by the server action that persists the result.
 */

export class InvalidTaskPositionError extends Error {}

export type ReorderOutcome = {
  sourceTaskIds: string[];
  destinationTaskIds: string[];
};

/**
 * Moves `taskId` out of `sourceTaskIds` and into `destinationTaskIds` at
 * `destinationIndex`. When `sourceColumnId === destinationColumnId` this is
 * a same-column reorder and both returned lists are the same array.
 */
export function reorderTask(
  sourceColumnId: string,
  sourceTaskIds: string[],
  destinationColumnId: string,
  destinationTaskIds: string[],
  taskId: string,
  destinationIndex: number
): ReorderOutcome {
  const fromIndex = sourceTaskIds.indexOf(taskId);
  if (fromIndex === -1) {
    throw new InvalidTaskPositionError(`Task ${taskId} was not found in its source column`);
  }

  const sameColumn = sourceColumnId === destinationColumnId;

  const workingSource = [...sourceTaskIds];
  workingSource.splice(fromIndex, 1);

  const workingDestination = sameColumn ? workingSource : [...destinationTaskIds];

  if (!Number.isInteger(destinationIndex) || destinationIndex < 0) {
    throw new InvalidTaskPositionError(`Invalid destination position: ${destinationIndex}`);
  }
  if (destinationIndex > workingDestination.length) {
    throw new InvalidTaskPositionError(`Invalid destination position: ${destinationIndex}`);
  }

  workingDestination.splice(destinationIndex, 0, taskId);

  return sameColumn
    ? { sourceTaskIds: workingDestination, destinationTaskIds: workingDestination }
    : { sourceTaskIds: workingSource, destinationTaskIds: workingDestination };
}

/** Maps an ordered id list to the 0-based positions that get persisted. */
export function toPositions(orderedTaskIds: string[]): { id: string; position: number }[] {
  return orderedTaskIds.map((id, position) => ({ id, position }));
}

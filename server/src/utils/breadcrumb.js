import Container from "../models/Container.js";

// Walks parentId pointers from a container up to the root Room, returning
// an array ordered root -> leaf, e.g. [Kitchen, Cupboard 2].
// Capped at 50 hops so a corrupted/circular parentId chain can't hang a request.
export async function getBreadcrumb(containerId) {
  const path = [];
  let currentId = containerId;
  let hops = 0;

  while (currentId && hops < 50) {
    const container = await Container.findById(currentId).select(
      "name type parentId"
    );
    if (!container) break;
    path.unshift({
      _id: container._id,
      name: container.name,
      type: container.type,
    });
    currentId = container.parentId;
    hops++;
  }

  return path;
}

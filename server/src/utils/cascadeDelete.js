import Container from "../models/Container.js";
import Item from "../models/Item.js";

// Deleting a container (e.g. a Room) must also remove everything nested
// inside it — sub-containers at any depth, and every item those contain.
// BFS down the parentId tree collecting ids, then delete items + containers
// in bulk rather than one-by-one.
export async function cascadeDeleteContainer(containerId, houseId) {
  const idsToDelete = [containerId];
  let frontier = [containerId];

  while (frontier.length > 0) {
    const children = await Container.find({
      houseId,
      parentId: { $in: frontier },
    }).select("_id");
    const childIds = children.map((c) => c._id);
    if (childIds.length === 0) break;
    idsToDelete.push(...childIds);
    frontier = childIds;
  }

  await Item.deleteMany({ houseId, containerId: { $in: idsToDelete } });
  await Container.deleteMany({ houseId, _id: { $in: idsToDelete } });

  return idsToDelete;
}

import Fuse, { FuseResult } from "fuse.js";

const search = <Type>(
  needle: string,
  haystack: Type[],
  fuseHaystack: Fuse<Type>,
): FuseResult<Type>[] => {
  if (needle === "") {
    return haystack.map((item, refIndex) => {
      return {
        item,
        refIndex,
        score: 0,
      };
    });
  }

  return fuseHaystack.search(needle);
};

export { search };

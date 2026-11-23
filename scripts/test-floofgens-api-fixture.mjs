// Executable API response regression checks for floofgens.net's live
// artist/copyright/contributor groups and historical e6AI variants.
import { strict as assert } from "node:assert";
import { APIPost } from "../src/js/components/api/responses/APIPost.ts";
import { unwrapResponse } from "../src/js/components/api/responses/ResponseUnwrap.ts";

const floofgensTags = {
  artist: ["artist_one", "artist_two"],
  contributor: ["artist_two", "colorist"],
  copyright: ["example_series"],
  general: ["solo", "digital_media"],
  character: ["sample_character"],
  species: ["fox"],
  invalid: [],
  meta: ["hi_res"],
  lore: [],
};
const originalTags = JSON.stringify(floofgensTags);
const normalized = APIPost.normalizeTags(floofgensTags);
assert.deepEqual(normalized.director, ["artist_one", "artist_two", "colorist"]);
assert.deepEqual(normalized.franchise, ["example_series"]);
assert.deepEqual(normalized.character, ["sample_character"]);
assert.deepEqual(normalized.species, ["fox"]);
assert.equal(JSON.stringify(floofgensTags), originalTags, "normalization must not mutate input");

const post = { id: 194198, tags: floofgensTags };
const tags = APIPost.getTags(post);
assert(tags.includes("artist_one") && tags.includes("example_series") && tags.includes("fox"));
assert.equal(tags.length, new Set(tags).size, "all tags should be unique");

const historicE6aiTags = {
  director: ["historic_director"],
  franchise: ["historic_franchise"],
  character: ["historic_character"],
  species: ["historic_species"],
  general: ["historic_general"],
  invalid: [],
  meta: ["historic_meta"],
};
const historic = APIPost.normalizeTags(historicE6aiTags);
assert.deepEqual(historic.director, ["historic_director"]);
assert.deepEqual(historic.franchise, ["historic_franchise"]);
assert.deepEqual(historic.character, ["historic_character"]);
assert.deepEqual(historic.species, ["historic_species"]);
assert.deepEqual(historic.meta, ["historic_meta"]);
assert.deepEqual(APIPost.getTags({ id: 1, tags: historicE6aiTags }), [
  "historic_director", "historic_franchise", "historic_character",
  "historic_general", "historic_meta", "historic_species",
]);
const legacy = APIPost.normalizeTags({
  director: ["old_director"], franchise: ["old_franchise"], general: ["old_general"],
});
assert.deepEqual(legacy.director, ["old_director"]);
assert.deepEqual(legacy.franchise, ["old_franchise"]);
assert.deepEqual(APIPost.normalizeTags(undefined).director, []);

// Floofgens' default post API now uses PostBlueprint with "files" and "stats"
// and flat (basic mode) tags. Our current renderer relies on the v1 legacy shape.
const newDefaultPost = {
  id: 194198,
  files: { meta: { md5: "abc", ext: "png" }, original: { url: "https://static1.floofgens.net/data/a.png" } },
  stats: { score: { up: 1, down: 0, total: 1 }, fav_count: 2 },
  tags: ["solo", "fox"],
};
const legacyPost = {
  id: 194198,
  file: { md5: "abc", ext: "png", url: "https://static1.floofgens.net/data/a.png" },
  preview: { url: "https://static1.floofgens.net/data/preview/a.jpg" },
  sample: { has: false, url: null },
  score: { up: 1, down: 0, total: 1 },
  tags: floofgensTags,
};
assert.equal("file" in newDefaultPost, false);
assert.equal(Array.isArray(newDefaultPost.tags), true);
assert.equal(typeof legacyPost.file.url, "string");
assert.equal(Array.isArray(legacyPost.tags.artist), true);

const samplePosts = [post, { id: 194193, tags: historicE6aiTags }];
assert.deepEqual(unwrapResponse({ posts: samplePosts }, "posts"), samplePosts);
assert.deepEqual(unwrapResponse(samplePosts, "posts"), samplePosts);
assert.deepEqual(unwrapResponse({ post }, "post"), [post]);
assert.deepEqual(unwrapResponse(post, "post"), [post]);
assert.deepEqual(unwrapResponse({ posts: [] }, "posts"), []);
assert.deepEqual(unwrapResponse(null, "posts"), []);
console.log("floofgens.net API tag categories and wrapped/unwrapped responses passed");

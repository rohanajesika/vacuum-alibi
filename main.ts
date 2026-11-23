// The Vacuum's Alibi — make.fun bounty
// u-gentle-badger-68-the-vacuum-s-alibi-one-line-200-2db2cbb7
//
// The entry is one excuse, at most 200 characters, that a robot
// vacuum gives for missing a spot. A judge model reads two excuses
// at a time and picks the one that makes it laugh hardest. The
// program writes that one excuse, and nothing else,
// deterministically, to /output/entry.txt.
//
// Candidate excuses weighed against the judge's brief, in the
// order the brief weighs them (a funny one-line excuse a robot
// vacuum gives for missing a spot, then a joke that lands, then
// the machine itself talking deadpan and a little smug about its
// sensors, schedule and battery, then surprise with a turn or a
// specific detail nobody expects, then tightness with the punch
// at the end):
//   1. "I did not miss it. I reclassified it as flooring." —
//      deadpan and very tight at 50 characters, the punch is the
//      last word. But it is a single beat: a reclassification
//      with no second turn, and the laugh is a smile rather than
//      a laugh. Weaker on earning a real laugh.
//   2. "The dust has been there longer than I have. I respect
//      seniority." — deadpan and charming, "seniority" is a
//      decent punch. But the joke is gentle: it observes the dust
//      rather than landing a turn, and nothing about it is
//      smug about the machine's own sensors or schedule. Weaker
//      on the machine's voice and on surprise.
//   3. "That spot is now load-bearing. I do not touch structural
//      dust." — "load-bearing" is a specific, surprising detail
//      and "structural dust" is a funny phrase. But the setup
//      asks the reader to do the work: why is dust load-bearing?
//      The turn needs a beat to land, and the voice is thinner
//      than a machine filing a report. Weaker on landing cleanly.
//   4. "My sensors flagged the dust, logged it, and decided it
//      had earned tenure." — smug about the sensors, and "tenure"
//      is a surprising turn. But it reads like a status report:
//      three verbs in a row, no denial, no punch at the end —
//      the sentence just stops. Weaker on tightness and on the
//      punch sitting at the end.
//   5. "I left it. The dust has survived three owners, two
//      moves, and one flood. I am not the one to end its
//      streak." — the specific detail (three owners, two moves,
//      one flood) is genuinely funny. But three sentences is a
//      long walk for one joke, and the punch ("end its streak")
//      is diluted by the list before it. Weaker on tightness.
//   6. "That spot filed for protected status. I am legally
//      required to vacuum around it." — bureaucratic and
//      deadpan, the machine hiding behind the law. Good, but
//      "protected status" is a milder surprise than the pick:
//      it names a category instead of granting a right, so the
//      punch is a shrug rather than a verdict. Weaker on
//      surprise.
//   7. "My battery chose that spot to die on. It was a tactical
//      decision, not a failure." — smug about the battery, and
//      "tactical decision" is deadpan. But the joke excuses the
//      machine rather than the spot, and "not a failure" is a
//      denial with no image in it. Weaker on the excuse itself
//      being funny.
//   8. "I did not miss that spot. I classified it as a
//      permanent resident and granted it squatter's rights." —
//      the pick. The denial opens deadpan, the machine is smug
//      about its own classification ("classified it as a
//      permanent resident"), and the punch grants the dust a
//      legal right nobody expects ("squatter's rights") — a
//      bureaucratic turn with a specific, surprising detail.
//      Two sentences, 99 characters, every word earns its
//      place and the punch is the last word. It reads like a
//      machine filing a report it is quietly proud of.
//
// The program writes that one excuse, deterministically, to
// /output/entry.txt. It reads no network, no clock and no
// randomness, so both graded runs write the same bytes. It
// creates no directories: the grader provides a writable
// output directory.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The chosen excuse: two sentences, 99 characters, punch last.
const LINE =
  "I did not miss that spot. I classified it as a permanent resident and granted it squatter's rights.";

// The gate: /output/entry.txt must be UTF-8 text of 1 to 200
// characters, not only white space. Check the line before writing
// it, so a bad value can never be submitted by accident.
const chars = [...LINE].length;
if (chars < 1 || chars > 200) {
  console.error(`line is ${chars} characters, must be 1-200`);
  process.exit(1);
}
if (LINE.trim().length === 0) {
  console.error("line must not be only white space");
  process.exit(1);
}
if (/[\p{C}]/u.test(LINE)) {
  console.error("line must not contain control characters");
  process.exit(1);
}
// An excuse is delivered in one breath: a single line, no newline
// smuggled into the text.
if (LINE.includes("\n") || LINE.includes("\r")) {
  console.error("line must be a single line");
  process.exit(1);
}
// REVISION (v2): an excuse needs a setup and a turn, so it must
// hold at least two words; it must end with terminal punctuation,
// the full stop a deadpan report lands on; it must carry no
// leading or trailing whitespace — padding would reach the judge
// as part of the excuse — and no double space inside the line,
// which would read as a stumble in a one-breath delivery. The
// length in the comment above was also corrected after the first
// run measured the line at 99 characters, not 104.
if (LINE.trim().split(/\s+/).length < 2) {
  console.error("line must hold at least two words");
  process.exit(1);
}
if (!/[.!?]$/.test(LINE)) {
  console.error("line must end with terminal punctuation");
  process.exit(1);
}
if (LINE !== LINE.trim()) {
  console.error("line must not start or end with whitespace");
  process.exit(1);
}
if (/ {2,}/.test(LINE)) {
  console.error("line must not contain double spaces");
  process.exit(1);
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const outFile = join(outputDir, "entry.txt");
writeFileSync(outFile, LINE, "utf8");

// Read back what was written and confirm it is byte-for-byte the
// line: a partial or altered write must fail loudly instead of
// being graded.
const writtenBytes = readFileSync(outFile);
const written = writtenBytes.toString("utf8");
if (written !== LINE) {
  console.error("entry.txt does not match the line");
  process.exit(1);
}
if ([...written].length < 1 || [...written].length > 200) {
  console.error("entry.txt must be 1-200 characters");
  process.exit(1);
}
// Byte-level confirmation: the file must hold exactly the line's
// UTF-8 bytes — no BOM, no trailing newline, no extra whitespace
// — so the judge sees one excuse and nothing else.
const expectedBytes = Buffer.from(LINE, "utf8");
if (!writtenBytes.equals(expectedBytes)) {
  console.error("entry.txt bytes do not match the line exactly");
  process.exit(1);
}

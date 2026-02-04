# Dream Wiki Seeder

A lightweight Node.js utility for seeding a local wiki-style dataset from image metadata to https://github.com/cithukyaw/dream-wiki ([dream-wiki.lovable.app](https://dream-wiki.lovable.app/)). This repository contains small scripts and utilities used to fetch, process, and save metadata and image-related JSON output into an organized `output/` folder.

**Key Files:**
- `package.json`: project metadata and dependencies.
- `env.example`: example environment variables.
- `gemini.js`, `googleapis.js`, `ollama.js`, `openrouter.js`: adapters / scripts that interact with different APIs or models.
- `utils.js`: shared helper functions.
- `merge-json.js`: utility script to merge all JSON files from output subfolders into consolidated database files.

**Data layout**
- `data/`: input folders with per-letter subfolders  (e.g. `data/က/`) used as sources.
- `data/done/`: the completed parsed images grouped by letter (e.g. `data/done/က/`) after generating JSON output.
- `output/`: generated output JSON grouped by letter (e.g. `output/က/`).
- `db/`: consolidated JSON files with merged data from all files in each output subfolder (e.g. `db/က.json`).
- `logs/`: runtime logs and error traces.

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Create your environment file from the example and set API keys you need:

```bash
copy env.example .env
# then edit .env and fill values
```

**Usage**

- Run a script directly with Node. Examples:

```bash
node gemini.js
node openrouter.js
node googleapis.js
node ollama.js
```

Each script has its own behavior — they generally read from `data/` (or a configured input), call an external API or model, and write results into `output/` and `logs/`.

- To merge all JSON files from output subfolders into consolidated database files:

```bash
node output.js
```

This script reads all JSON files from each `output/<letter>/` subfolder, merges them (combining arrays for duplicate keys), and saves the consolidated data as `db/<letter>.json` files.

**Notes on output**

- Output files are JSON objects stored under `output/<letter>/` matching the input grouping. Filenames such as `IMG_1719144672694.json` indicate per-item result files produced by the seeder.
- The `db/` directory contains consolidated JSON files (e.g., `က.json`, `ခ.json`) that merge all individual JSON files from their respective output subfolders. These files combine duplicate keys by merging their arrays.
- Check `logs/` for detailed run information and errors.

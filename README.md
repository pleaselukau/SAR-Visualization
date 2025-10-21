
# Interactive Visualization of Structure-Activity Relationships in Antimalarial Compounds

## CS 529: Visual Data Science (VDS) - Fall 2025

**University of Illinois Chicago (UIC)**

-----

## Team

  * **Project Manager:** Please Lukau
  * **Team Members:** *(Harsh Shelke, Hrushikesh Joshi)*
  * **Clients:** Dr. Kevin A. Kunz and Prof. Paul R. Carlier (UICentre)

-----

## Project Overview

This project aims to design and build an interactive, browser-based visualization system to help medicinal chemists explore **Structure-Activity Relationships (SAR)** in a real-world drug discovery dataset. The goal is to understand how small changes in a chemical's structure influence its effectiveness as a potential antimalarial drug.

The system will visualize a dataset of antimalarial compounds, all sharing a common **ẞ-carboline** molecular backbone. It will allow researchers to visually detect patterns, clusters, and outliers by linking a compound's measured antimalarial potency with its calculated physicochemical properties (like size, polarity, and lipophilicity) and its 2D chemical structure. Unlike standard tools like Excel or Tableau, this system will integrate chemical structure rendering and similarity computations directly into the visual analysis. This visual analysis helps guide decisions on which compounds are most promising for future synthesis.

-----

## Key Features

  * **Interactive, Multi-dimensional Plots:** Will include scatterplots and parallel-coordinates views to explore correlations between chemical properties (e.g., `logP`, `TPSA`) and antimalarial potency (`pEC50`).
  * **Coordinated & Linked Views:** Selecting a compound in one plot (e.g., a property scatterplot) will instantly highlight its corresponding 2D molecular structure and its position in all other linked views.
  * **On-the-Fly Structure Rendering:** Will render 2D molecular structures directly from their SMILES text notation.
  * **Chemical Space Visualization:** Will use dimensionality reduction (PCA or t-SNE) to map the high-dimensional "chemical space" of all compounds, helping to identify clusters of structurally similar molecules.
  * **Dynamic Filtering & Brushing:** Users will be able to interactively filter and select (e.g., with a lasso tool) subsets of compounds based on potency, properties, or structural similarity.

-----

## Technology Stack

  * **Data Processing & Backend:** **Python**, Pandas, and Flask.
  * **Cheminformatics:** **RDKit** (used for processing SMILES, computing molecular fingerprints/properties, and rendering 2D structures as SVGs).
  * **Frontend Visualization:** **D3.js** (for all interactive graphics and plots).

-----

## Data

The dataset, originally provided by the Carlier laboratory at UIC as an Excel file, contained 105 compounds. After data cleaning (which removed 10 rows with invalid potency values), the final dataset used for visualization contains **95 compounds**.

The key data fields are:

  * **`Compound_ID`**: The unique identifier (e.g., `CAR-0000058`).
  * **`SMILES`**: The chemical structure in SMILES notation (a text format).
  * **`pEC50`**: The measured antimalarial potency (the target variable for visualization).
  * **Five computed physicochemical properties**:
      * `MW` (Molecular Weight)
      * `logP` (Log P, a measure of lipophilicity)
      * `logD` (Log D)
      * `pKa` (Acid dissociation constant)
      * `TPSA` (Topological Polar Surface Area)
  * **`Synonyms`**: Other known identifiers for the compound (e.g., `MMV1919292`).

-----

## Instructions

Credits: This support code was written by Andrew Wentzel, Electronic Visualization Laboratory (EVL) at UIC, and adapted here for this repository.

### Installing Node and npm

There are several ways to install Node.js (required to run this React app).

- The easiest way is to install from the official site:

  https://nodejs.org/en/download

  During installation, npm will also be installed. You can ignore non-critical warnings during install.

- Verify installations in your terminal:

  ```bash
  node -v
  npm -v
  ```

  If either command is not found, ensure your PATH includes the Node and npm binaries (on Windows check Environment Variables). Some installers also ship a custom shell; you can use your normal terminal as long as PATH is set correctly.

#### Optional: Using Node Version Manager (NVM)

If you are on Ubuntu/Linux or macOS and need multiple Node versions, consider NVM:

https://github.com/nvm-sh/nvm

Install a specific Node version (this project runs on modern Node that supports Create React App; v16+ recommended):

```bash
nvm install 18
```

### Getting the Code

You can either clone via Git or download the ZIP.

- Clone:
  ```bash
  git clone https://github.com/pleaselukau/SAR-Visualization
  cd SAR-Visualization
  ```
- Or download the ZIP and extract it, then `cd` into the folder.

### Install and Run

From the project root:

```bash
npm install
npm start
```

This launches the development server and opens `http://localhost:3000/` in your browser. Hot reload is enabled.

### Project Structure (Simplified)

- `src/App.js` — Top-level app; toggles between three views and manages shared state.
- `src/Whitehat.js` — First view (to replace the prior White Hat).
- `src/Blackhat.js` — Second view (to replace the prior Black Hat).
- `src/WhiteHatStats.js`, `src/BlackHatStats.js` — Stats panels.
- `src/D3Component.js`, `src/useSVGCanvas.js` — D3 template and helper hook.

Data and assets:

- `public/us-states.geojson` — Map geometry.
- `public/processed_gundeaths_data.json` — Placeholder data; will be replaced by backend pipeline output (see below).
- `python/Preprocessing.ipynb` and CSVs — Optional preprocessing resources.

### Editing the Files

- You will primarily edit: `src/Whitehat.js` and `src/WhiteHatStats.js` for the "White Hat" solution.
- `src/Blackhat.js` and `src/BlackHatStats.js` provide a working reference for map and stats implementations.
- `src/App.js` manages shared state (e.g., `brushedState`, `zoomedState`) and data fetching. Update here if you change layout, add views, or add new data sources.

### Creating a New D3 Visualization

Use `D3Component.js` as a template. To create a new component named `PlotD3`:

1. Copy `src/D3Component.js` to `src/PlotD3.js`.
2. Change the export signature in the new file:

```javascript
export default function PlotD3(props) {
  // ...
}
```

3. Add D3 code inside the provided `useEffect` hooks. Example patterns:

```javascript
// Runs after SVG is ready and on window resize
useEffect(() => {
  if (svg !== undefined) {
    // initial drawing or responsive logic
  }
}, [svg]);

// Runs when SVG is ready AND data is loaded/changes
useEffect(() => {
  if (svg !== undefined && props.data !== undefined) {
    // data-driven drawing
  }
}, [svg, props.data]);
```

4. Import and use in `App.js` within a container of the desired size:

```javascript
import PlotD3 from './PlotD3';

// ... inside render/return
<div style={{ height: '50px', width: '50px' }}>
  <PlotD3 data={gunData} />
  {/* pass ToolTip if you need it: ToolTip={ToolTip} */}
  {/* pass other shared state as needed */}
 </div>
```

### Loading New Data

Data is loaded asynchronously from `public/`. For JSON:

```javascript
async function fetchData() {
  fetch('data.json').then(r => r.json()).then(newData => {
    setData(newData);
  });
}
```

For CSV with D3:

```javascript
import * as d3 from 'd3';

async function fetchCSV() {
  d3.csv('data.csv').then(rows => {
    setData(rows);
  });
}
```

Call your loaders inside a one-time hook in `App.js`:

```javascript
useEffect(() => {
  fetchData();
  // fetchCSV();
}, []);
```

If a parameter should trigger reloads, list it in the dependency array:

```javascript
useEffect(() => {
  fetchDataWithParam(param);
}, [param]);
```

### Tooltips Helper

The app ships a `ToolTip` helper class (see `App.js`) and CSS in `App.css` (class `tooltip`). You can use it inside D3 event handlers:

```javascript
let tTip = d3.select('.tooltip');

selection
  .on('mouseover', (e, d) => {
    tTip.html(getToolTipText(d));
    ToolTip.moveTTipEvent(tTip, e);
  })
  .on('mousemove', (e) => ToolTip.moveTTipEvent(tTip, e))
  .on('mouseout', () => ToolTip.hideTTip(tTip));
```

Ensure the tooltip CSS includes `position: absolute;` so it can be positioned near the cursor.

### Brushing and Linking Pattern

Shared state (e.g., `brushedState`) lives in `App.js` and is passed to child views. In a map component, you may set it on hover and style selected elements via `useEffect`/`useMemo` hooks that depend on `brushedState`.

Example state in `App.js`:

```javascript
const [brushedState, setBrushedState] = useState();
```

Pass to children and update in event handlers. In your drawing hooks, respond to changes in `brushedState` by adjusting opacity/stroke of selected features and rendering linked highlights in stats components.

### Regenerating Processed Data (Optional)

If you need to re-create `processed_gundeaths_data.json`:

1. Install Python 3.9+ and a virtual environment.
2. Install dependencies (e.g., `pandas`, `jupyter`).
3. Open and run `python/Preprocessing.ipynb`.
4. Write the output to `public/processed_gundeaths_data.json` so the React app can fetch it.

### Common Issues

- Blank page or 404 on data fetch: Confirm files exist in `public/` with exact names and paths.
- Port in use: Stop other apps on 3000 or set a different port: `PORT=3001 npm start`.
- Install hiccups: Delete `node_modules/` and `package-lock.json`, then `npm install`.

-----

## Third View Added

`App.js` includes a placeholder third view (see function `thirdView()` and the toggle buttons in the header). This view is scaffolded so you can quickly prototype an additional visualization or UI panel without affecting the existing White/Black Hat views.

### How it works

- The `viewToggle` state (0 = White Hat, 1 = Black Hat, 2 = Third View) controls which view renders.
- `thirdView()` returns a two-panel layout consistent with the other views, including an instruction sidebar and a content area sized to fill the remaining width/height.
- Shared app state (e.g., `zoomedState`, `brushedState`, `selectedStuff`) is available to pass into new components you add to this view, enabling linking/coordination with future panels if desired.

Relevant code in `src/App.js`:

```javascript
// toggle logic
const hat = () => {
  if (viewToggle === 0) return makeWhiteHat();
  if (viewToggle === 1) return makeBlackHat();
  return thirdView();
};

// button group
<button onClick={() => setViewToggle(2)} className={viewToggle === 2 ? 'inactiveButton' : 'activeButton'}>
  {"Third View"}
</button>
```

-----

## Data Replacement Note

- The current "Gun Deaths" dataset (`public/processed_gundeaths_data.json`) is a placeholder. In production, this will be replaced by processed output from the backend pipeline. Ensure the backend emits a JSON (or other agreed format) compatible with the fetch paths in `src/App.js`.
- When integrating the backend, update the fetch URLs in `App.js` (and any other components) to point to your API endpoint or to a new file name in `public/` if still serving statically.

## View Naming Update

- `Whitehat.js` and `Blackhat.js` represent the first and second views, respectively. As you transition to the final application, refer to them as "First View" and "Second View" in UI and documentation. The third placeholder view in `App.js` can be evolved into any additional view as needed.


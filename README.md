
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

## Acknowledgements

The starter code template for this project was provided by **Andrew Wentzel**.
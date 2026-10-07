# Web Provenance Engine

> Don't just search the web. Understand where the information comes from.

## Live Demo

[Open Web Provenance Engine](https://web-provenance-engine.lovable.app )

## What is Web Provenance Engine?

The web contains an enormous amount of information, but finding information is no longer the hardest part.

The harder questions are:

- Where did this information originally come from?
- How many sources independently support a claim?
- Are 20 websites actually 20 independent sources?
- Which sources support a claim?
- Which sources contradict it?
- Which sources are simply repeating the same information?
- How credible are the sources?
- How did a particular trend spread across the web?

Web Provenance Engine is designed to answer these questions.

Instead of simply returning a list of search results, it analyzes the web evidence behind a claim or trend and turns it into a comprehensive evidence and provenance analysis.

The goal is simple:

> Turn search results into understanding.

## The Problem

Traditional search engines are excellent at finding webpages.

But when researching an important claim, a user may end up with:

```text
30 search results
        ↓
15 articles saying the same thing
        ↓
10 articles copying those articles
        ↓
5 genuinely independent sources
```

A search engine generally presents these as separate results.

This creates a major problem:

> More search results do not necessarily mean more evidence.

For example, if 20 websites publish information that originally came from the same report, those 20 websites should not automatically be treated as 20 independent confirmations.

Users currently have to manually open articles, compare them, identify repeated information, trace citations, and determine what actually supports or contradicts a claim.

Web Provenance Engine aims to make this process much faster and clearer.

## What Web Provenance Engine Does

The application has two main modes.

### Claim Analysis

Enter a claim and investigate what the web says about it.

For example:

> “Electric vehicles are better for the environment than petrol cars.”

The engine analyzes relevant search results and organizes the information into:

- Supporting evidence
- Contradicting evidence
- Neutral/contextual evidence
- Source quality
- Source relationships
- Repeated information
- Independent sources
- Information provenance
- Overall evidence assessment

Instead of making the user read dozens of pages, the application provides a structured overview of the evidence.

### Trend Detection

Enter a topic or emerging trend and investigate how it developed across the web.

For example:

> “AI coding agents”

The engine can help investigate:

- Where the trend appears to have started
- Early sources discussing it
- When interest increased
- Major events associated with the trend
- How information propagated
- Which sources amplified the topic
- Whether the apparent popularity comes from independent sources or repeated information

The goal is to understand not only what is trending, but also:

> Where did the trend come from, and how did it spread?

## Core Idea: Information Provenance

One of the key ideas behind Web Provenance Engine is source lineage.

Consider this simplified example:

```text
Original Report
├── News Website A
├── News Website B
├── Blog C
└── Website D
```

A search engine might show all of these as separate results.

Web Provenance Engine tries to identify relationships between them. This helps distinguish between source diversity and information repetition.

For example:

- 30 results analyzed
- 11 appear to be independent sources
- 19 appear to contain repeated or related information

This gives users a much better understanding of the actual evidence landscape.

## Information Echo Detection

A major feature of the project is identifying what can be thought of as an information echo.

An information echo occurs when the same underlying information is repeatedly published or referenced across many websites.

For example:

```text
Original Source
├── Site A
├── Site B
├── Site C
└── More websites
```

The result may look like widespread independent confirmation. But in reality, many sources may ultimately be based on the same underlying information.

Web Provenance Engine attempts to make this visible.

## Supporting vs. Contradicting Evidence

For a claim, the application separates evidence into meaningful categories.

### Supporting Evidence

Sources that provide information supporting the claim.

### Contradicting Evidence

Sources that disagree with or weaken the claim.

### Context / Neutral Evidence

Sources that provide relevant information without directly supporting or contradicting the claim.

This allows the user to see the broader evidence landscape rather than receiving a simplistic TRUE / FALSE answer.

## Evidence Assessment

The application provides an overall assessment based on the analyzed evidence.

Possible outcomes can include:

- Supported
- Mostly Supported
- Partially Supported
- Insufficient Evidence
- Contradicted

The purpose is not to blindly declare something true or false. Instead, the application explains why the evidence points in a particular direction.

## Why SerpApi?

SerpApi is a fundamental part of Web Provenance Engine.

The application uses SerpApi to retrieve real web search results, which become the raw material for the provenance and evidence analysis.

The important distinction is:

> SerpApi provides the search landscape. Web Provenance Engine analyzes that landscape.

The project does not simply display SerpApi results. It uses those results to investigate:

- Claims
- Evidence
- Source relationships
- Supporting information
- Contradicting information
- Repeated information
- Source independence
- Provenance
- Trends
- Information propagation

This transforms raw search results into a more useful evidence intelligence experience.

## Key Features

- Claim investigation
- Evidence analysis
- Supporting evidence detection
- Contradicting evidence detection
- Neutral/contextual evidence
- Source relationship analysis
- Information provenance
- Information echo detection
- Source independence analysis
- Source quality/context
- Trend detection
- Trend timeline
- Possible trend origin detection
- Trend propagation analysis
- Comprehensive evidence summaries
- Access to the underlying sources

## Using the Application

### Claim Analysis

1. Open the application.
2. Select **Claim Analysis**.
3. Enter a claim you want to investigate.
4. Start the analysis.
5. Review the overall assessment.
6. Explore supporting and contradicting evidence.
7. Examine source relationships and information echoes.
8. Review the underlying sources.

### Trend Detection

1. Open the application.
2. Select **Trend Detection**.
3. Enter a topic or trend.
4. Start the analysis.
5. Explore the trend timeline.
6. Investigate possible origins.
7. Examine how information propagated.
8. Review the sources behind the trend.

## Running the Project Locally

You can run Web Provenance Engine on your own computer without Lovable.

### Prerequisites

You need:

- [Node.js](https://nodejs.org/ )
- [Bun](https://bun.sh/ )
- A SerpApi API key

### Clone the Repository

Replace the placeholders with your repository URL and project folder name:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```

You can also download the repository as a ZIP file from GitHub and extract it.

### Install Dependencies

From inside the project folder, run:

```bash
bun install
```

### Add Your SerpApi API Key

Create a file named `.env` in the project root and add:

```env
SERPAPI_API_KEY=your_serpapi_api_key_here
```

Replace the value with your own SerpApi API key.

**Important:** Never commit your `.env` file or expose your API key publicly.

### Start the Development Server

Run:

```bash
bun run dev
```

The terminal will provide a local address, such as:

```text
http://localhost:8080
```

Open that address in your browser.

## API Key Security

Your SerpApi API key is private.

For local development, keep it inside your local `.env` file. Make sure the `.env` file is included in `.gitignore` and is not committed to the repository.

If deploying the application to another hosting platform, configure the API key using that platform's environment-variable settings rather than publishing it in the source code.

## Project Structure

The project is organized around two main investigation modes:

```text
Web Provenance Engine
├── Claim Analysis
│   ├── Claim assessment
│   ├── Supporting evidence
│   ├── Contradicting evidence
│   ├── Neutral/contextual evidence
│   ├── Source analysis
│   ├── Source independence
│   └── Information provenance
└── Trend Detection
    ├── Trend overview
    ├── Timeline
    ├── Possible origin
    ├── Source analysis
    └── Information propagation
```

## Demo

A demonstration video of the application is available through the hackathon submission.

The demo showcases:

- Claim investigation
- Evidence analysis
- Supporting and contradicting sources
- Source relationships
- Information echo detection
- Trend detection
- Trend provenance

## SerpApi India Hackathon 2026

This project was created for the SerpApi India Hackathon 2026.

The project focuses on using web search data to improve how people understand information found online.

### Track

**Knowledge & Public Interest**

The project is focused on research, information verification, source transparency, and understanding how information spreads across the web.

## AI-Assisted Development

This project was developed with the assistance of AI-powered development tools, including Lovable.

AI assistance was used during the development process, while the resulting application and concept were developed specifically for this project.

## Why This Matters

The web has made information abundant.

But abundance creates another problem:

> It becomes difficult to distinguish information from evidence.

A claim can appear on dozens of websites without having dozens of independent sources behind it.

A trend can appear everywhere without it being clear where it started.

Web Provenance Engine is an attempt to make that hidden structure visible.

Instead of asking only:

> “What does the web say?”

it asks:

> “Where did this information come from, how independently is it supported, what contradicts it, and how did it spread?”

## Future Possibilities

Web Provenance Engine could eventually be expanded to support:

- More advanced provenance graphs
- Historical claim tracking
- Real-time trend monitoring
- Cross-language source analysis
- Deeper source credibility analysis
- Citation tracing
- Academic research workflows
- News verification
- Investigative journalism
- Research assistance
- Misinformation and information-echo analysis

## Project Links

### Live Application

[https://web-provenance-engine.lovable.app](https://web-provenance-engine.lovable.app )

### Source Code

<!-- Add your GitHub repository URL here. -->

## Built for SerpApi India Hackathon 2026

**Web Provenance Engine**  
*From search results to evidence.*

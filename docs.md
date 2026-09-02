# API NASA
## API utili per il progetto
### GIBS
Global Imagery Browse Services, fornisce immagini satellitari, in questo progetto viene utilizzata come fonte delle immagini satellitari dei siti di lancio.
### NASA Image and Video Library
Fornisce foto, video e anche audio dall'archivio NASA, probabilmente l'API più importante per il progetto, è possibile filtrare i contenuti per keyword (possiamo usare per esempio la missione) e periodo.

## Perché così poche?
Le API pubbliche di NASA non forniscono dati sulle missioni nello specifico, l'unica che si avvicina è "Open Science Data Repository", tuttavia il suo focus è sugli esperimenti effettuati a bordo, di conseguenza i dati sulla missione in se sono pochi e disponibili per poche missioni. Avrei potuto usare alcune API specifiche di alcune missioni per mostrarne i dati sulla pagina della rispettiva missione, questo sarebbe per esempio il caso dell'API di InSight o del Mars Rover, tuttavia l'API di InSight contiene pochissimi dati che a causa di guasti potrebbero anche non essere corretti, quella del Mars Rover invece è stata deprecata e non è nemmeno più presente tra le API della NASA.
## API/Dataset esterni
La specifica del progetto sembrerebbe limitare l'utilizzo alle API su https://api.nasa.gov/, elencherò comunque alcune fonti esterne interessanti.

### NSSDCA
NASA Space Science Data Coordinated Archive, fornito sempre pubblicamente dalla NASA, secondo le mie ricerche dovrebbe contenere tutti i dati di tutte le missioni effettuate, sarebbe stata la fonte perfetta, tuttavia, sempre secondo le mie ricerche, risulta essere offline da dicembre 2025.

### API Wordpress
NASA usa due siti web:
- [https://www.nasa.gov]
- [https://science.nasa.gov]

entrambi i siti web utilizzano una API Wordpress accessibile a `/wp-json/wp/v2/mission` che forniscono missioni in un formato quasi identico, unendo i due dataset, otterremmo il dataset totale delle missioni, purtroppo però ho incontrato alcuni problemi, il primo (meno importante) è la gestione delle date, è disponibile nella proprietà `meta` della missione, tuttavia c'è solo un valore che a volte manca, a volte indica la data di inizio (es. Artemis II), altre quella di fine (es. Apollo 11), si potrebbe usare l'API OSDR per ottenerle, purtroppo però questa API fornisce i dati di una frazione delle missioni, inoltre mancherebbero dati come il pianeta target o l'area geografica. L'altro problema, molto più importante, riguarda i dati provenienti dall'API del sito science, nonostante la struttura dei dati sia quasi identica, gli autori degli articoli lasciano la maggior parte dei valori vuoti, rendendoli quindi inutili, la soluzione allora sarebbe usare solo i dati provenienti dalla prima API, il problema è che missioni di altissima rilevanza come JWST e Hubble si trovano sul sito science e molti dei loro dati sono mancanti.
### The Space Devs
API di terze parti che fornisce letteralmente qualsiasi dato di nostro interesse, l'unico difetto è che l'API free ha un limite di 15 richieste all'ora, una volta settato il DB non sarebbe un problema, basterebbe popolarlo piano piano, purtroppo però durante lo sviluppo potrebbe risultare scomodo. In ogni caso non fa parte delle API NASA, quindi non è utilizzabile.

## Passi successivi
Se fosse esistita una API delle missioni, avrei potuto usarla per costruire un database completo delle missioni, determinare le più rilevanti tramite un punteggio calcolato in base a numero di media, durata, tipologia, successo/fallimento, ... e poi arricchire i dati disponibili per queste e per quelle che vengono cercate dagli utenti utilizzando le API, purtroppo però l'unica opzione è scegliere manualmente una lista di missioni da inserire nel DB, essendo già fatta manualmente la selezione delle più rilevanti risulta inutile dato che posso concentrarmi proprio su queste, con l'aiuto dell'IA ho quindi creato il file `seed_missions.json` che contiene le missioni e il relativo sito di lancio in questo formato:
```json
{
	"launch_sites": [
		{
			"id": string,
			"name": string,
			"locality": string,
			"country": string,
			"latitude": number,
			"longitude": number
		},
		{...},
		...
	],
	"missions": [
		{
			"name": "Apollo 11",
			"launch_date": "1969-07-16",
			"end_date": "1969-07-24",
			"type": "crewed",
			"program": "Apollo",
			"destination": "Moon",
			"outcome": "success",
			"launch_site_id": "ksc-lc39a",
			"search_keyword": "Apollo 11"
		},
		{...},
		...
	]
},
```

dove
- launch_sites - siti di lancio
	- id - id del sito di lancio
	- name - nome del sito di lancio
	- località - località del sito di lancio
	- country - paese del sito di lancio (nella lista attuale compaiono solo i valori `USA` e `French Guiana`)
	- latitude - latitudine del sito di lancio
	- longitudine - longitudine del sito di lancio
- missions - missioni
	- name - nome della missione
	- launch_date - data di lancio
	- end_date - data del termine della misssione (null quando ancora in corso)
	- type - tipo di missione, può essere `crewed`, `robotic`, `telescope` o `rover`
	- program - il programma spaziale della missione
	- destination - destinazione della missione, se indica il nome di un pianeta vuol dire che la missione ha come destinazione il suolo o l'orbita di quel pianeta, se invece vale `deep space`, vuol dire che non ha una destinazione specifica se non lo spazio profondo
	- outcome - l'esito della missione, può essere `success`, `failed`, `null` (per missioni ancora in corso) o `partial` (successo parziale)
	- launch_site_id - id del sito di lancio da cui è stata lanciata la missione, utilizzata per query con JOIN
	- search_keyword - parola chiave da utilizzare nelle ricerche delle API NASA (NASA Image and Video Library)

Questi dati verranno inseriti in apposite tabelle tramite uno script e verranno poi arricchiti con media provenienti dalla NASA Image and Video Library e GIBS.

# Features/Frontend
Il frontend è sviluppato il vite + react, implementa le seguenti features.
## Homepage
La homepage è la pagina che viene aperta inizialmente, da il benvenuto all'utente con una breve spiegazione e alcune statistiche sui dati salvati:
- Missioni disponibili
	- Totali
	- In corso
	- Completate
- Media disponibili con breakdown per categoria
- Missione con il maggior numero di media con breakdown per categoria

## Missions
Mostra un elenco a griglia delle missioni disponibili, è possibile cercare una missione per nome scrivendolo nella barra di ricerca, è inoltre possibile aprire un menu dei filtri che permette di filtrare la ricerca per:
- Tipo
- Paese
- Status
- Periodo di lancio

Per ogni missione viene mostrata un'immagine di copertina, il nome della missione e il programma, cliccare su un risultato ne apre la relativa pagina.

## Mission
La pagina della missione mostra tutte le relative informazioni importate dal file seed, oltre a queste mostra un'immagine di copertina (di default l'immagine più vecchia) e un breakdown dei conteggi dei media per categoria.

È possibile cliccare sul tasto "indietro" in alto a sinistra per tornare alla ricerca oppure cliccare su compare per aggiungere la missione all'elenco di quelle che si vuole confrontare.

Cliccare sul sito di lancio ne apre la pagina.

## Launch site
La pagina del sito di lancio mostra le relative informazioni ottenute dal file seed, il numero di missioni lanciate da esso, il numero di esse ancora in corso, un elenco delle missioni lanciate da esso e un'immagine satellitare del sito.

È possibile cliccare una missione dall'elenco per aprirne la pagina.
## Compare
Mostra una tabelle che mette a confronto le missioni per quantità di media, data di lancio, data di fine e durata, sotto la tabella è possibile visualizzare, tra quelle selezionate, la missione con più media per ogni categoria, la missione più vecchia e quella più lunga.

Per aggiungere una missione al confronto bisogna andare sulla relativa pagina e cliccare il tasto "compare" in alto a destra. Per rimuovere una missione dal confronto basta cliccare sul tasto "x" accanto al nome della missione all'interno della tabella.

## Sidebar
La sidebar è sempre visibile, permette di passare da una sezione all'altra cliccando la relativa icona e di cambiare il tema (chiaro/scuro).

# Schema database
Ho scelto di usare un database PostgreSQL per la familiarità acquisita durante i corsi univeritari.

Il file dello schema è accessibile a `/nasa-missions-dashboard/db/schema.sql`.
## Tabelle
### launch_sites
```postgresql
CREATE TABLE launch_sites (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	locality TEXT NOT NULL,
	country TEXT NOT NULL,
	latitude NUMERIC(8, 5) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
	longitude NUMERIC(8, 5) NOT NULL CHECK (longitude BETWEEN -180 AND 180)
);
```

Usiamo l'id del file seed come primary key (abbiamo dovuto impostarlo a priori per poter creare la relazione con le missioni), tutti i dati vengono dal file seed, nessuno può essere `NULL` e l'unico controllo di cui abbiamo bisogno è che latitudine e longitudine siano nei limiti possibili.

### missions
```postgresql
CREATE TABLE missions (
	id SERIAL PRIMARY KEY,
	slug TEXT NOT NULL UNIQUE,
	name TEXT NOT NULL UNIQUE,
	program TEXT,
	launch_date DATE NOT NULL,
	end_date DATE,
	type TEXT NOT NULL
		CHECK (type IN ('crewed', 'robotic', 'telescope', 'rover')),
	destination TEXT NOT NULL,
	outcome TEXT
		CHECK (outcome IN ('success', 'partial', 'failure')),
	launch_site_id TEXT NOT NULL REFERENCES launch_sites(id),
	search_keyword TEXT NOT NULL,
	cover_image_override TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

	status TEXT GENERATED ALWAYS AS (
		CASE WHEN end_date IS NULL THEN 'ongoing'
		ELSE 'completed' END
	) STORED,

	CHECK (end_date IS NULL OR end_date >= launch_date)
);
```

Oltre ai dati del seed salviamo dati aggiuntivi:
- slug - slug generato a partire dal nome della missione tramite una funzione sluggify, utile per richiedere dati su una missione specifica agli endpoint
- cover_image_override - `NULL` di default, quando è `NULL` verrà usata l'immagine più vecchia come immagine di copertina, altrimenti verrà usato il suo valore come nasa id dell'immagine di copertina
- created_at - timestamp della del momento in cui la missione è stata importata
- updated_at - timestamp dell'ultima modifica alla missione
- status - indica lo stato della missione, può essere `ongoing` (in corso) o `completed` (completata), quando la data di fine è `NULL` vuol dire che la missione è ancora in corso, verrà quindi segnata come `ongoing`, se invece è presente verrà segnata come `completed`

Vengono anche eseguiti alcuni controlli, type e outcome devono assumere uno dei valori specificati, la data di lancio non può essere successiva a quella di fine.

### media_assets
```postgresql
CREATE TABLE media_assets (
	id BIGSERIAL PRIMARY KEY,
	mission_id INT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
	nasa_id TEXT NOT NULL,
	title TEXT NOT NULL,
	description TEXT,
	media_type TEXT NOT NULL
		CHECK (media_type IN ('image', 'video', 'audio')),
	date_created DATE,
	ingested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	UNIQUE (mission_id, nasa_id)
);
```

Contiene i dati sui media dell'API NASA Image and Video Library, i media vengono importati tramite un script di ingestion che cerca tutti i media di una o tutte le missioni.
- id - id all'interno del DB, bigserial, quindi viene assegnato automaticamente aumentando di uno a ogni assegnamento
- mission_id - id della missione, permette di eseguire JOIN con esse
- nasa_id - id all'interno del database della NASA, permette di ricostruire l'URL dell'immagine `https://images-assets.nasa.gov/image/<cover_nasa_id>/<cover_nasa_id>~<size>.jpg` dove size può essere: `thumb`, `small`, `medium` o `large`
- title - titolo del media
- description - descrizione del media
- media_type - tipo di media, può essere `image`, `video` o `audio`
- date_created - data di creazione del media
- ingested_at - il momento in cui è stato importato il media dall'ingestion script

Per una maggiore sicurezza rendo unique la coppia (mission_id, nasa_id), tuttavia non dovrebbe essere necessario.

### sync_jobs
```postgresql
CREATE TABLE sync_jobs (
	id SERIAL PRIMARY KEY,
	mission_id INT REFERENCES missions(id) ON DELETE SET NULL,
	started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	finished_at TIMESTAMPTZ,
	status TEXT NOT NULL DEFAULT 'running'
		CHECK (status IN ('running', 'success', 'partial', 'failed')),
	assets_found INT,
	assets_written INT,
	error_message TEXT
);
```

Ha il compito di loggare le esecuzioni dell'ingestion script, quando l'esecuzione inizia viene creata una nuova entry, vengono inseriti il mission_id, started_at e status = 'running', al termine dell'esecuzione viene aggiornata con finished_at, status in base all'esito, numero di media trovati e scritti (lo script importa solo media nuovi quindi i numeri possono essere diversi) ed eventuale messaggio di errore.

### api_cache
```postgresql
CREATE TABLE api_cache (
	cache_key TEXT PRIMARY KEY,
	payload JSONB NOT NULL,
	fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	expires_at TIMESTAMPTZ
);
```

Una cache per le richieste alle API NASA, viene usata per le richieste a GIBS, usando questa cache è possibile velocizzare chiamate ripetute alle API NASA, quando viene eseguita una chiamata viene salvata una nuova entry:
- cache_key - stringa nel formato \<nome api>:\<parametri> che identifica la richiesta
- payload - risultato della richiesta
- fetched_at - il momento in cui è stata ricevuta la versiona cachata
- expires_at - il momento in cui la versione cachata scade e va aggiornata

Quando viene chiamata una API NASA controllo se ne ho una versione cachata, se esiste e non è arrivato ancora expires_at restituisco quella, altrimenti inoltro la chiamata all'API NASA, salvo poi il risultato per le prossime chiamate, in questo modo posso richiederla più velocemente, evitare il rate limit e ridurre il carico sui server NASA.

expires_at è pari a fetched_at + TTL (Time To Live), il TTL viene scelto per ogni API in base a quanto spesso variano i dati, se per esempio salvassi nella cache i risultati dell'API Astronomy Picture Of the Day (APOD) su giorni specifici potrei non settarlo dato che i dati rimangono costanti. Nelle chiamate a GIBS per le immagini satellitari le immagini risalgono solitamente al giorno precedente, quindi ho settato un TTL di 12 ore.

## Viste
### media_counts
```postgresql
CREATE MATERIALIZED VIEW media_counts AS
SELECT
	m.id AS mission_id,
	ma.media_type,
	COUNT(*) AS asset_count,
	MIN(ma.date_created) AS first_asset_date,
	MAX(ma.date_created) AS last_asset_date
FROM missions m
JOIN media_assets ma ON ma.mission_id = m.id
GROUP BY m.id, ma.media_type;
```

L'unica vista del database, tiene il conto dei media per tipo di ciascuna missione, la data del più vecchio e quella del più nuovo.

# Backend
Ho scelto come backend Node.js + Express, anche in questo caso è stato a causa della familiarità acquisità durante i corsi universitari.
Il file del server, `/src/server.js` è molto semplice, avvia il server sulla porta indicata nel file .env (o sulla porta 3000 se non lo trova), importa le rotte nei file della cartella `/src/routes`, ne fornisce una per testare la connessione al DB e fornisce un error handler generico.

La connessione al DB avviene tramite il file `/src/db.js` viene chiamato il costruttore di `pg.Pool` passando come stringa di connessione l'URL del DB preso dal file .env. Esporta anche una funzione `query(text, params)`, in questo modo dato che dobbiamo comunque importare questo script per poter usare il DB ne approfittiamo per creare un wrapper di `Pool.query`.

## Scripts
### seed
Script per importare i dati all'interno del file `/db/seed_missions.json`, lo script legge il JSON, esegue una funzione sluggify per generare lo slug della missione a partire dal nome
### ingest-media
Script per l'ingest dei media delle missioni, può essere chiamato per tutte le missioni in una volta, oppure per una sola specificandone lo slug.

Lo script chiama l'endpoint `https://images-api.nasa.gov/search?q=<search_term>&page=<page>`, questo restituisce 100 immagini alla volta per quel search_term (preso dalla tabella delle missioni), include anche il numero totale di risultati e se ci sono altre pagine contiene anche un elemento `links[0].rel = "next"`, finché lo script trova questo elemento, continuerà a chiamare le pagine successive con un delay di 300 ms (per non abusare di una API pubblica). 
Ogni volta che trova un'immagine nuova ne inserirà i metadati all'interno di media_assets.
All'inizio dell'esecuzione aggiungerà un nuovo sync_job, al termine questo verrà aggiornato in base all'esito, verrà anche aggiornata la view media_counts.
## Endpoint API sviluppati
### GET /api/health
Endpoint di test, serve solo a verificare l'avvio del server e la connessione al DB.
```json
{
	"status": string,
	"database": string
}
```

- status - `ok`/`degraded`
- database - `connected`/`unreachable`
### GET /api/missions
Fornisce una lista di missioni
Filtri opzionali:
- name - termine di ricerca sul nome.
- from - data minima in formato MM-DD-YYYY
- to - data massima in formato MM-DD-YYYY
- type - il tipo di missione `crewed`, `robotic`, `telescope`, `rover`
- country - il paese in cui è avvenuto il lancio, nella lista attuale solo `USA` e `French Guiana`
- status - stato di completamento della missione `ongoing` o `completed`

restituisce un array nel formato:
```json
[
	{
		"id": int,
		"slug": string,
		"name": string,
		"program": string,
		"launch_date": string,
		"end_date": string,
		"type": string,
		"destination": string,
		"status": string,
		"outcome": string,
		"launch_site_name": string,
		"locality": string,
		"country": string,
		"latitude": string,
		"longitude": string,
		"cover_nasa_id": string
	},
	{...},
	...
]
```

dove:
- id - id della missione all'interno del DB
- slug - slug del nome della missione, utilizzato per richiedere dati tramite altri endpoint
- name - nome della missione
- program - programma spaziale della missione
- launch_date - data di lancio
- end_date - data della fine della missione, se la missione è `ongoing` sarà `null`
- type - tipo della missione, come sopra
- destination - pianeta di destinazione (che sia un atterraggio o in orbita) o `deep space`
- status - stato di completamento della missione, `ongoing` o `completed`
- locality - località del sito di lancio
- country - paese del sito di lancio
- latitude, longitude - coordinate del sito di lancio
- cover_nasa_id - id nasa dell'immagine di copertina, utilizzabile per recuperare l'immagine tramite l'URL `https://images-assets.nasa.gov/image/<cover_nasa_id>/<cover_nasa_id>~<size>.jpg` dove size può essere: `thumb`, `small`, `medium` o `large`

### GET /api/missions/:slug
Restituisce i dati di una missione dato lo slug.
I dati restituiti sono nel formato:
```json
{
	"id": int,
	"slug": string,
	"name": string,
	"program": string,
	"launch_date": string,
	"end_date": string,
	"type": string,
	"destination": string,
	"outcome": string,
	"launch_site_id": string,
	"search_keyword": string,
	"cover_image_override": string,
	"created_at": string,
	"updated_at": string,
	"status": string,
	"launch_site_name": string,
	"locality": string,
	"country": string,
	"latitude": string,
	"longitude": string,
	"cover_nasa_id": string
}
```

dove i dati seguono lo stesso schema usato nell'endpoint `GET /api/missions` con l'aggiunta di:
- launch_site_id - id del sito di lancio, utilizzabile per richiedere i dati del sito di lancio tramite l'endpoint `GET /api/launch-sites/:id`
- search_keyword - parola usata come termine di ricerca in altre API (per esempio NASA Image and Video Library)
- cover_image_override - permette di specificare un nasa id alternativo per l'immagine di copertina della missione, se non specificato cover_nasa_id assumerà il valore del nasa id dell'immagine più vecchia.
- created_at - indica la data in cui la missione è stata aggiunta al DB
- updated_at - indica la data dell'ultimo aggiornamento della missione

### GET /api/launch-sites/:id
Restituisce i dati di un sito di lancio dato il suo id.
I dati forniti sono nel formato:
```json
{
	"id": string,
	"name": string,
	"locality": string,
	"country": string,
	"latitude": string,
	"longitude": string,
	"missions": [
	    {
		    "name": string,
		    "slug": string,
		    "program": string,
		    "cover_nasa_id": string
	    },
	    {...},
	    ...
	],
	"satellite_image": {
		"url": string,
		"cached_until": string
	}
}
```

dove:
- id - id del sito di lancio
- name - nome del sito di lancio
- locality - località del sito di lancio
- country - paese del sito di lancio, nella lista attuale solo `USA` e `French Guiana`
- latitude, longitude - coordinate del sito di lancio
- missions - array contenente l'elenco delle missioni partite da questo sito
	- name - nome della missione
	- slug - slug della missione
	- program - nome del programma della missione
	- cover_nasa_id - nasa id dell'immagine di copertina, per ulteriori informazioni guardare `GET /api/missions`
- satellite_image - immagine satellitare del sito di lancio, cachata nel DB
	- url - URL dell'endpoint `GET /api/launch-sites/:id/satellite-image`
	- cached_until - scadenza della cache

### GET /api/launch-sites/:id/satellite-image
Dato l'id di un sito di lancio preleva dalla API cache del DB l'immagine satellitare, se il TTL della cache è esaurito (12 ore) ne fetcha una nuova tramite l'API GIBS, restituisce l'immagine in formato jpg.

### GET /api/stats/missions
Restituisce i conteggi delle missioni totali, in corso e completate all'interno del DB.
```json
{
	"label": "Missions available",
	"total": int,
	"by_type":{
		"ongoing": int,
		"completed": int
	}
}
```

### GET /api/stats/media
Restituisce il breakdown dei conteggi dei media all'interno del DB e i dati dei media della missione che ne ha di più.
```json
{
	"label": "Media available",
	"total": int,
	"by_type": {
		"image": int,
		"video": int,
		"audio": int
	},
	"top_mission": {
		"slug": string,
		"name": string,
		"total": int,
		"by_type": {
			"image": int,
			"video": int,
			"audio": int
		}
	}
}
```

### GET /api/stats/media/by-mission
Restituisce il breakdown dei conteggi dei media di ogni missione.
```json
[
	{
		"slug": string,
	    "name": string,
	    "total": int,
	    "by_type": {
			"image": int,
		    "video": int,
		    "audio": int
	    }
	},
	{...},
	...
]
```

### GET /api/stats/launch-sites
Restituisce l'elenco dei siti di lancio con numero di missioni lanciate da esso e di queste il numero di missioni ancora in corso.
```json
[
	{
	    "id": string,
	    "name": string,
	    "latitude": number,
	    "longitude": number,
	    "missions_launched": int,
	    "still_ongoing": int
	},
	{...},
	...
]
```

### GET /api/missions/:slug/media
Restituisce il breakdown dei conteggi dei media, la data di creazione del primo elemento e la data di creazione dell'ultimo per una missione dato il suo slug.
```json
{
	"total": int,
	"by_type": {
		"image": int,
		"video": int,
		"audio": int
	},
	"first_asset_date": string,
	"last_asset_date": string
}
```

### GET /api/missions/:slug/media/timeline
Restituisce la timeline delle frequenze di media per mese di una specifica missione dato il suo slug.
```json
[
	{
	    "month": string,
	    "assets": int
	},
	{...},
	...
]
```

L'array contiene un oggetto per ogni mese a partire da quello del primo media della missione, fino all'ultimo. `month` contiene la data dell'ultimo giorno del rispettivo mese e `assets` contiene la frequenza assoluta di media in quel mese.

Per mancanza di tempo questa route è rimasta inutilizzata.

### GET /api/missions/:slug/media/images
Ha come parametri facoltativi `page` e `size` che indicano rispettivamente pagina e dimensione della pagina (default 1 e 10).
Restituisce la pagina indicata di link di immagini della missione a cui appartiene lo slug, l'output è nel formato:
```json
{
	"items": [
		{
			"nasa_id": string,
			"title": string,
			"description": string,
			"media_type": string,
			"date_created": string,
			"links":[
				string,
				string,
				string,
				string
			]
		},
		{...},
		...
	],
	"page": int,
	"size": int,
	"total_hits": int,
	"next": int
}
```

L'array `items` contiene i dati più rilevanti di ogni immagine, l'array `links` contiene 4 URL, ognuno di questi punta a diversi livelli di qualità dell'immagine (thumb, small, medium, large).
`page` indica la pagina richiesta, `size` la dimensione della pagina, `total_hits` il numero totale di immagini di quella missione, `next` indica la prossima pagina, se è null allora non ci sono pagine successive.

Per mancanza di tempo questo enpoint è rimasto inutilizzato.

### GET /api/missions/:slug/media/videos
Endpoint per i video funziona quasi esattamente come il precedente ma per i video.
Ha come parametri facoltativi `page` e `size` che indicano rispettivamente pagina e dimensione della pagina (default 1 e 10).
Restituisce la pagina indicata di link di video della missione a cui appartiene lo slug, l'output è nel formato:
```json
{
	"items": [
		{
			"nasa_id": string,
			"title": string,
			"description": string,
			"media_type": string,
			"date_created": string,
			"links":[
				string
			]
		},
		{...},
		...
	],
	"page": int,
	"size": int,
	"total_hits": int,
	"next": int
}
```

L'array `items` contiene i dati più rilevanti di ogni video, l'array `links` contiene un URL che punta al video.
`page` indica la pagina richiesta, `size` la dimensione della pagina, `total_hits` il numero totale di video di quella missione, `next` indica la prossima pagina, se è null allora non ci sono pagine successive.

Per mancanza di tempo questo enpoint è rimasto inutilizzato.
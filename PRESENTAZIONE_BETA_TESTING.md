# Progetto Pilota: Sperimentazione Operativa "CFVA - Fuoco Prescritto"
**Proposta di Beta Testing e Validazione sul Campo**

---

## 1. Obiettivo della Presentazione
Questa relazione non intende presentare un prodotto finito, ma illustrare lo stato di avanzamento di un **prototipo sperimentale** e chiedere l'autorizzazione per una fase di **test operativi controllati**.
L'obiettivo è duplice:
1. Verificare l'utilità reale dell'Intelligenza Artificiale nelle procedure GAUF.
2. Identificare bug, limiti critici e inefficienze prima di un'eventuale adozione estesa.

---

## 2. Il Progetto: Stato dell'Arte
L'applicazione è attualmente in fase **Alpha/Beta**. Sono state implementate le funzionalità core basate sui protocolli GAUF/Campbell Prediction System, ma mancano i dati di riscontro sul campo ("Grounded Truth").

### Cosa fa il Sistema (Funzionalità da Validare):
*   **Supporto Decisionale AI:** Utilizza il modello *Gemini Pro* di Google per elaborare dati meteo/orografici e suggerire parametri tattici.
*   **Analisi Rapida:** Calcolo automatizzato di ROS (Velocità di avanzamento) e Lunghezza di Fiamma.
*   **Reportistica:** Generazione automatica di bozze per la reportistica operativa.
*   **Geolocalizzazione e SOS:** Funzioni di tracciamento per la sicurezza degli operatori.

**Nota Bene:** Allo stato attuale, l'AI è uno strumento di supporto e *non* sostituisce la valutazione umana. La sperimentazione serve proprio a misurare il margine di errore dell'AI rispetto alla valutazione esperta del DOS.

---

## 3. Limitazioni Tecniche del Prototipo (Critico)
Essendo un ambiente di test, il sistema presenta alcune limitazioni strutturali che è doveroso segnalare per onestà intellettuale:

### ⚠️ Quote e API Key
Il progetto attuale utilizza **chiavi API gratuite o semi-professionali**. Questo comporta:
*   **Limiti di Rate:** Esiste un numero massimo di richieste al minuto. In uno scenario di test con un singolo operatore non è un problema, ma in un uso simultaneo da parte di molte squadre il sistema potrebbe bloccarsi temporaneamente.
*   **Privacy:** Sebbene sicure, le API consumer non offrono le garanzie contrattuali tipiche delle soluzioni Enterprise.

### 🏗️ Evoluzione verso un'App "Professionale"
Per passare dal prototipo attuale a una **prodotto ufficiale del Corpo Forestale**, sarà necessario:
1.  **Infrastruttura Dedicata:** Abbandonare le chiavi gratuite e acquisire licenze Enterprise per le API di Intelligenza Artificiale (garantendo uptime del 99.9% e privacy dei dati).
2.  **Server CFVA:** Ospitare il database e il backend sui server sicuri della Regione, non su cloud pubblici.
3.  **Certificazione:** Una revisione del codice da parte dei tecnici regionali per validare la sicurezza informatica.

---

## 4. Perché una Fase di Beta Testing?
L'introduzione di tecnologie avanzate in contesti critici richiede cautela. Non possiamo assumere che il software sia infallibile.

**Ci serve capire:**
*   **Affidabilità dell'AI:** L'intelligenza artificiale "allucina"? I consigli tattici sono sempre validi nel contesto specifico della macchia mediterranea sarda?
*   **Usabilità in Condizioni Reali:** L'interfaccia è leggibile sotto il sole? I pulsanti sono utilizzabili con i guanti? La modalità offline è stabile in zone d'ombra radio?
*   **Bug e Crash:** Identificare errori software che si verificano solo dopo uso prolungato o intensivo.

---

## 5. Metodologia di Sperimentazione Proposta
Si propone un periodo di test non invasivo durante le normali attività addestrative o di fuoco prescritto programmato.

1.  **Affiancamento:** L'app viene usata da un solo operatore in parallelo alle procedure standard (cartacee/mentali).
2.  **Confronto Dati:** A fine operazione, si confrontano i dati previsti dall'app con quelli rilevati realmente.
3.  **Report Bug:** Registrazione puntuale di ogni errore, comportamento anomalo o suggerimento errato fornito dall'AI.

---

## 6. Il Potenziale dell'Intelligenza Artificiale per il Corpo
Nonostante la prudenza necessaria, questo progetto dimostra che il CFVA può essere pioniere nell'uso di tecnologie emergenti.
Se validato e perfezionato, un sistema simile potrebbe in futuro:
*   **Ridurre l'Erroe Umano:** Fornendo una "seconda opinione" basata su dati oggettivi.
*   **Standardizzare le Procedure:** Uniformando il metodo di calcolo e reportistica tra i vari reparti.
*   **Formazione Continua:** Funzionare come simulatore per l'addestramento delle nuove leve.

---

## 7. Conclusioni
Chiediamo di considerare questo software non come una soluzione definitiva, ma come un **banco di prova tecnologico**.
Identificare oggi i limiti e i problemi di questo approccio ci permetterà di costruire domani strumenti informatici solidi, affidabili e veramente utili per la sicurezza e l'efficienza del Corpo Forestale.

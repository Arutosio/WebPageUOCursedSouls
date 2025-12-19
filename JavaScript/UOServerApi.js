/**
 * Classe per l'interazione con l'API di un server ModernUO.
 */
export default class UOServerApi {
    constructor(ip, port, username = null, password = null) {
        this.baseUrl = `http://${ip}:${port}`;
        this.auth = (username && password) 
            ? btoa(`${username}:${password}`) 
            : null;
    }

    /**
     * Helper privato per le richieste fetch
     */
    async _fetchData(endpoint) {
        const headers = { 'Content-Type': 'application/json' };
        if (this.auth) { headers['Authorization'] = `Basic ${this.auth}`; }

        // Creiamo un controller per il timeout: se il server non risponde entro 3 secondi, annulliamo
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        try {
            const response = await fetch(`${this.baseUrl}/${endpoint}`, { 
                method: 'GET',
                headers: headers,
                signal: controller.signal // Colleghiamo il timeout
            });

            clearTimeout(timeoutId);

            if (!response.ok) return null; 
            return await response.json();
        } catch (error) {
            // Se è un errore CORS o di rete, 'error' sarà un TypeError o AbortError
            console.warn(`Shard Link Offline: ${endpoint}`); 
            return null; // Restituiamo null per attivare la logica OFFLINE nel dashboard
        }
    }

    /**
     * Ottiene lo stato generale del server (Status, Version, Uptime)
     */
    async getServerStatus() {
        return await this._fetchData('api/status');
    }

    /**
     * Ottiene la lista completa dei giocatori online
     */
    async getPlayerList() {
        return await this._fetchData('api/players');
    }

    /**
     * Ottiene statistiche dettagliate (Mappa, Oggetti, Account totali)
     */
    async getGlobalStats() {
        return await this._fetchData('api/stats');
    }
}
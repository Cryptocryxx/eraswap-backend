import logger from '../logging/logger.js';

/**
 * Middleware-Funktion, die bei jeder Anfrage aufgerufen wird und die Methode sowie die URL der Anfrage protokolliert.
 * 
 * @param req: Object -> Die Anfrage
 * @param res: Object -> Die Antwort
 * @param next: Function -> Nächste Middleware-Funktion im Stapel
 */

function logMiddleware(req, res, next) {
    logger.info(`Anfrage erhalten: ${req.method} ${req.originalUrl}`);
    next();
}


export default logMiddleware;
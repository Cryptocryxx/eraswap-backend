import email from '../utils/email.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Diese Methode dient dazu, die Anmeldeinformationen eines Benutzers zu überprüfen.
 * 
 * @param req: Object -> Die Anfrage
 * @param res: Object -> Die Antwort
 * @param getLoginData: Function -> Funktion zum Abrufen der Anmeldeinformationen aus der Datenbank
 * @return: Boolean -> true, wenn der Benutzer gefunden wurde, andernfalls eine entsprechende Statusmeldung
 */
async function sendEMail(req, res) {
    const { toMail, fromMail, header, body } = req.body
    try {
        const mail = email.sendEmail(header, body, toMail, fromMail);
        console.log(mail)

        if(mail != undefined || mail != null){
            if ("Nachricht erfolgreich gesendet!"){
            res.json(mail)
            }
        }else {
            res.status(500).json("Something unexpected happen")
        }
    } catch (err){
        res.status(500).json("Something went wrong!" + err)
    }
}

async function logFile(req, res) {
    console.log("first")
    try {
        const { user, door, body } = req.body
        if (logInFile(door, body, user)) {
            res.status(200).json({ success: true, message: 'Log erfolgreich gespeichert' });
        }else {
            res.status(500).json({ success: false, message: 'Fehler beim Schreiben des Logs' });
        }
    } catch (err){
        res.status(500).send("Something went wrong!" + err)
    }
}

async function logInFile(door, body, user = "angi") {
    try {
        const logEntry = `${new Date().toISOString()} - user: ${user} - message: ${JSON.stringify(body)}\n`;

    // Logfile-Pfad
    const logFilePath = path.join(__dirname, '..', 'logging', 'logs', `door${door}.log`);
  
    // Log in Datei schreiben
    fs.appendFile(logFilePath, logEntry, (err) => {
      if (err) {
        console.error('Fehler beim Schreiben des Logs:', err);
        return false
      }
      return true
    });
    } catch (err){
        throw err
    }
}

export default {
    sendEMail,
    logFile,
    logInFile
};
import * as Realm from "realm-web";
import { startOfWeek, addDays, endOfWeek, addWeeks, endOfDay, startOfDay } from 'date-fns';

// Add your App ID
const app = new Realm.App({ id: "climbing-app-ongai" });


export async function loginWithGoogle(response: any) {
    debugger
    const credentials = Realm.Credentials.google({ idToken: response.credential });
    return app
        .logIn(credentials)
        .then((user) => alert(`Logged in with id: ${user.id}`));
}

export async function loginAnonymous() {
    const credentials = Realm.Credentials.anonymous();
    // Authenticate the user
    const user = await app.logIn(credentials);
    return user;
}

export function getUser() {
    return app.currentUser;
}


export function getWetherCollection() {
    const mongo = app.currentUser?.mongoClient('mongodb-atlas');
    if (mongo) {
        const collection = mongo.db('test').collection('wether');
        return collection;
    }
    return null;
}

export function getPlacesCollection() {
    const mongo = app.currentUser?.mongoClient('mongodb-atlas');
    if (mongo) {
        const collection = mongo.db('test').collection('places');
        return collection;
    }
    return null;
}

export async function getPlaces() {
    const placesCollection = getPlacesCollection();
    if (placesCollection) {
        return await placesCollection.find({});
    }
    return [];
}

function getDateRange(dateSelected: string): { start: Date, end: Date } {
    switch (dateSelected) {
        case 'Fin de Semana': {
            const fechaActual = new Date();
            const fechaInicioSemana = startOfWeek(fechaActual);
            const fechaInicioFinSemana = addDays(fechaInicioSemana, 6);
            const fechaFinFinSemana = endOfDay(addDays(fechaInicioFinSemana, 1));
            
            return {start: fechaInicioFinSemana, end : fechaFinFinSemana};
        }
        case 'Mañana': {
            const fechaActual = addDays(new Date(), 1);
            const start = startOfDay(fechaActual);
            const end = endOfDay(fechaActual);
            return {
                start, end
            }
        }

        default:
        case 'Hoy': {
            const fechaActual = new Date();
            const start = startOfDay(fechaActual);
            const end = endOfDay(fechaActual);
            return {
                start, end
            }
        }
    }
}

export async function getWether(dateSelected: string) {
    const { start, end } = getDateRange(dateSelected);

    const wetherCollection = getWetherCollection();
    if (wetherCollection) {
        const wetherDocs = await wetherCollection.find({
            date: {
                $gte: start,
                $lte: end
            }
        });
        return wetherDocs;
    }

    return [];

}
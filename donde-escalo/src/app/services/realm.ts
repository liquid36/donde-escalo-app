import * as Realm from "realm-web";
import { startOfWeek, addDays, endOfWeek, addWeeks, endOfDay } from 'date-fns';

// Add your App ID
const app = new Realm.App({ id: "climbing-app-ongai" });


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

export async function getWether() {
    const fechaActual = new Date();
    const fechaInicioSemana = startOfWeek(fechaActual);
    const fechaInicioFinSemana = addDays(fechaInicioSemana, 6);
    const fechaFinFinSemana = endOfDay(addDays(fechaInicioFinSemana, 1));

    const wetherCollection = getWetherCollection();
    if (wetherCollection) {
        const wetherDocs = await wetherCollection.find({
            date: {
                $gte: fechaInicioFinSemana,
                $lte: fechaFinFinSemana
            }
        });
        return wetherDocs;
    }

    return [];

}
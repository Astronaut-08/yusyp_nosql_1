// scripts/02_transform.js
// Запуск: mongosh "ВАШ_URI" --file scripts/02_transform.js

// !!! МІСЦЕ ДЛЯ ВАШОГО КОДУ !!!

use('spotify');

db.tracks.drop();

db.tracks_raw.aggregate([
    {
        $project: {
            track_id: 1,
            track_name: 1,
            album_name: 1,
            explicit: 1,
            popularity: 1,
            duration_ms: 1,
            track_genre: 1,
            artists_raw: '$artists',
            
            artists: {
                $map: {
                    input: { $split: ['$artists', ';'] },
                    as: 'artist',
                    in: { $trim: { input: '$$artist'} }
                }
            },

            audio_features: {
                danceability: '$danceability',
                energy: '$energy',
                loudness: '$loudness',
                speechiness: '$speechiness',
                acousticness: '$acousticness',
                instrumentalness: '$instrumentalness',
                liveness: '$liveness',
                valence: '$valence',
                tempo: '$tempo',
                key: '$key',
                mode: '$mode',
                time_signature: '$time_signature'
            },

            duration_sec: {
                $round: [{ $divide: ['$duration_ms', 1000] }, 1]
            },

            popularity_tier: {
                $switch: {
                    branches: [
                        { case: {gte: ['$popularity', 70]}, then: 'high' },
                        { case: {gte: ['$popularity', 40]}, then: 'medium' },
                        { case: {lt: ['$popularity', 40]}, then: 'low' }
                    ],
                    default: 'low'
                }
            }
        }
    },

    {
        $unset: [
            'artists_raw', 'duration_ms', 'danceability', 'energy', 'loudness', 'speechiness',
            'acousticness', 'instrumentalness', 'liveness', 'valence',
            'tempo', 'key', 'mode', 'time_signature'
        ]
    },
    {
        $out: 'tracks'
    }
]);

const total = db.tracks.countDocuments();
print('=============================');
print('Кількість документів: ', total);
print('=============================');

print('Виводимо один документ для перевірки структури: ')
printjson(db.tracks.findOne())

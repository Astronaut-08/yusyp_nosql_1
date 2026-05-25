// Завдання 1. Треки для вечірки
// Знайдіть треки, що підходять для вечірки. Такі треки повинні мати високий danceability (вище
// 0.7) та високу енергію (також вище 0.7), а тривалість — від 3 до 5 хвилин (180000–300000 мс).

db.tracks.find({
    "audio_features.danceability": { $gt: 0.7 },
    "audio_features.energy": { $gt: 0.7 },
    duration_sec: { $gte: 180, $lte: 300 }
})


// Завдання 2. Виконавці, у яких усі треки популярні
// Вважатимемо артиста популярним, якщо у нього є мінімум 3 треки і при цьому мінімальна
// популярність цих треків становить 60% або вище.
// Знайдіть топ-20 таких артистів і виведіть для кожного ім’я артиста кількість треків, мінімальну та
// середню популярність з точністю до одного знака після коми.

db.tracks.aggregate([
    { $unwind: '$artists' },

    {
        $group: {
            _id: '$artists',
            total_track: { $sum: 1 },
            min_popular: { $min: "$popularity" },
            avg_popular_raw: { $avg: { $toInt: "$popularity" } }
        }
    },

    {
        $match: {
            total_track: { $gte: 3 },
            min_popular: { $gte: 60 }
        }
    },

    { $sort: { min_popular: -1, total_track: -1 } },

    { $limit: 20 },

    {
        $project: {
            _id: 1,
            total_track: 1,
            min_popular: 1,
            avg_popular: { $round: ['$avg_popular_raw', 1] }
        }
    }
])

// Завдання 3. Нетипові треки
// Визначте треки з незвично високим темпом для їхнього жанру за наступним алгоритмом:
// спочатку розрахуйте середнє значення tempo за допомогою функції $avg та стандартне
// відхилення за допомогою $stdDevPop по кожному жанру, потім виберіть треки, у яких tempo
// перевищує середнє плюс два стандартні відхилення (tempo треку > mean жанру + 2 * stdDev жанру).
// У результаті для кожного жанру додайте поля: "avg_tempo" — середній темп, "genre" — назва
// жанру, "outlier_threshold" — значення порогу для нетипових треків, і "outlier_tracks" — масив
// об’єктів з інформацією про треки, наприклад:

// "avg_tempo": 119,
// "genre": "acoustic",
// "outlier_threshold": 178.5,
// "outlier_tracks": [
//   {
//     "_id": {"$oid": "69cf9875842453a5f5536f70"},
//     "track_name": "The Legend of Olog-hai, Pt. 1",
//     "popularity": 31,
//     "artists": ["The Bridge City Sinners"],
//     "audio_features": {
//       "tempo": 182.379
//     }
//   }
// ]

db.tracks.aggregate([
    {
        $group: {
            _id: '$track_genre',
            avg_tempo: { $avg: '$audio_features.tempo' },
            std_tempo: { $stdDevPop: '$audio_features.tempo' }
        }
    },

    {
        $lookup: {
            from: 'tracks',
            localField: '_id',
            foreignField: 'track_genre',
            as: 'all_tracks'
        }
    },

    { $unwind: '$all_tracks' },

    {
        $match: {
            $expr: {
                $gt: [
                    '$all_tracks.audio_features.tempo',
                    {
                        $add: [
                            '$avg_tempo',
                            { $multiply: [2, '$std_tempo'] }
                        ]
                    }
                ]
            }
        }
    },

    {
        $group: {
            _id: '$_id',
            avg_tempo: { $first: '$avg_tempo' },
            outlier_threshold: { $first: { $add: ['$avg_tempo', { $multiply: [2, '$std_tempo'] }] } },
            outlier_track: {
                $push: {
                    _id: '$all_tracks._id',
                    track_name: '$all_tracks.track_name',
                    popularity: '$all_tracks.popularity',
                    artists: '$all_tracks.artists',
                    audio_features: {
                        tempo: '$all_tracks.audio_features.tempo'
                    }
                }
            }
        }
    },

    {
        $addFields: {
            genre: '$_id'
        }
    },

    {
        $project: {
            _id: 0,
            avg_tempo: 1,
            genre: 1,
            outlier_threshold: 1,
            outlier_track: 1
        }
    },

    { $limit: 1 } // щоб побачити структуру бо багато записів
])

// Завдання 4: Треки для фонової роботи
// Знайдіть треки, які підходять для фонового прослуховування під час роботи: тихі (loudness < -10),
// з низькою мовленнєвою складовою (speechiness < 0,1), переважно інструментальні
// (instrumentalness > 0,5) і не містять explicit-контенту.

db.tracks.find({
    'audio_features.loudness': { $lt: -10 },
    'audio_features.speechiness': { $lt: 0.1 },
    'audio_features.instrumentalness': { $gt: 0.5 },
    'audio_features.explicit': { $ne: true },
})
